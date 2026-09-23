-- FUNCTION: public.bdm_fn_breakdowncompletion_rn_sb(text, text)
-- Fix: ORDER BY BDMS.* must stay inside the data subquery.
-- Putting it after UNION ALL with header rows causes:
--   missing FROM-clause entry for table "bdms"
-- which the Java db/callFunction layer returns as HTTP 403.

DROP FUNCTION IF EXISTS public.bdm_fn_breakdowncompletion_rn_sb(text, text);

CREATE OR REPLACE FUNCTION public.bdm_fn_breakdowncompletion_rn_sb(
    OUT total_count integer,
    OUT curbdm refcursor,
    p_condparam text DEFAULT '{}'::text,
    p_commonparam text DEFAULT '{}'::text)
RETURNS record
LANGUAGE plpgsql
COST 100
VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    v_sqlstr     text := '';
    v_condsql    text := '';
    v_condval    text;
    v_gridfilter text;
BEGIN

    v_condval := gen_fn_getfieldvalue(p_condparam, 'FLID');
    IF v_condval IS NOT NULL AND trim(v_condval) <> '' THEN
        v_condsql := v_condsql
            || ' AND ( BDMS.BDMS_FLID = ' || quote_literal(trim(v_condval))
            || ' OR POSITION(' || quote_literal(trim(v_condval))
            || ' IN COALESCE(BDMS.BDMS_ELEMENTID, '''')) > 0 ) ';
    END IF;

    v_condval := gen_fn_getfieldvalue(p_condparam, 'FROMDATE');
    IF v_condval IS NOT NULL AND trim(v_condval) <> '' THEN
        v_condsql := v_condsql
            || ' AND BDMS.BDMS_REPORTEDDATE::date >= to_date('
            || quote_literal(trim(v_condval))
            || ', ''DD-Mon-YYYY'') ';
    END IF;

    v_condval := gen_fn_getfieldvalue(p_condparam, 'TODATE');
    IF v_condval IS NOT NULL AND trim(v_condval) <> '' THEN
        v_condsql := v_condsql
            || ' AND BDMS.BDMS_REPORTEDDATE::date <= to_date('
            || quote_literal(trim(v_condval))
            || ', ''DD-Mon-YYYY'') ';
    END IF;

    v_condval := gen_fn_getfieldvalue(p_condparam, 'MACHINEID');
    IF v_condval IS NOT NULL AND trim(v_condval) <> '' THEN
        v_condsql := v_condsql
            || ' AND BDMS.BDMS_MACHINEID = '
            || quote_literal(trim(v_condval));
    END IF;

    v_gridfilter := gen_fn_getfieldvalue(p_commonparam, 'GRIDFILTER');
    IF v_gridfilter IS NOT NULL AND trim(v_gridfilter) <> '' THEN
        v_condsql := v_condsql || ' ' || v_gridfilter;
    END IF;

    v_sqlstr := $SQL$

SELECT
    4 AS dataorder,
    BDMS.BDMS_KEYID::text AS bdmskeyid,
    (COALESCE(MCHM.MCHM_MACHINENO, '') ||
        CASE
            WHEN COALESCE(MCHM.MCHM_MACHINENAME, '') <> ''
            THEN ' - ' || MCHM.MCHM_MACHINENAME
            ELSE ''
        END)::text AS equipment,
    COALESCE(BDMS.BDMS_PROBLEMDESCRIPTION, '')::text AS problemdescription,
    COALESCE(TRDM.TRDM_NAME, '')::text AS tradename,
    CASE
        WHEN BDMS.BDMS_WOSTARTTIME::date <= DATE '1801-01-01'
          OR BDMS.BDMS_WOSTARTTIME::date >= DATE '2100-12-31'
        THEN ''
        ELSE COALESCE(to_char(BDMS.BDMS_WOSTARTTIME, 'DD-Mon-YYYY HH24:MI'), '')
    END AS startdate,
    CASE
        WHEN BDMS.BDMS_WOENDTIME::date <= DATE '1801-01-01'
          OR BDMS.BDMS_WOENDTIME::date >= DATE '2100-12-31'
        THEN ''
        ELSE COALESCE(to_char(BDMS.BDMS_WOENDTIME, 'DD-Mon-YYYY HH24:MI'), '')
    END AS enddate,
    COALESCE(EMPM.EMPM_NAME, BDMS.BDMS_BOOKEDBY, '')::text AS bookedby,
    COALESCE(NULLIF(BDMS.BDMS_WNO, '{}'), '')::text AS wono,
    COALESCE(BDMS.BDMS_MACHINEID, '')::text AS machineid,
    COALESCE(BDMS.BDMS_FLID, '')::text AS flid,
    COALESCE(NULLIF(BDMS.BDMS_BOOKEDTRADE, '{}'), '')::text AS sectionid,
    COALESCE(BDMS.BDMS_STATUS::text, '')::text AS status

FROM BAL_BDM_TL_MST BDMS

LEFT JOIN GEN_TL_MACHINEMST MCHM
    ON BDMS.BDMS_MACHINEID = MCHM.MCHM_KEYID

LEFT JOIN GEN_TL_EMPLOYEEMST EMPM
    ON BDMS.BDMS_BOOKEDBY = EMPM.EMPM_KEYID

LEFT JOIN GEN_TL_TRADEMST TRDM
    ON BDMS.BDMS_BOOKEDTRADE = TRDM.TRDM_KEYID

WHERE BDMS.BDMS_ACTIVE = 'Y'
  AND COALESCE(BDMS.BDMS_STATUS, 'X') <> 'C'
  AND COALESCE(BDMS.BDMS_WOENDFLAG, 'N') <> 'Y'
  AND COALESCE(BDMS.BDMS_WOALLOTTEDFLAG, 'N') = 'Y'

$SQL$;

    v_sqlstr := v_sqlstr || v_condsql;
    v_sqlstr := 'SELECT * FROM (' || v_sqlstr
        || ' ORDER BY BDMS.BDMS_REPORTEDDATE DESC, BDMS.BDMS_KEYID DESC) bdmdata ';

    v_sqlstr :=
        'SELECT
        1 as dataorder,
            ' || quote_literal(colmodNew('TRUE','FALSE','FALSE','CENTER',120,'bdmskeyid','FALSE','TRUE')) || '::text AS bdmskeyid,
            ' || quote_literal(colmodNew('FALSE','FALSE','FALSE','CENTER',180,'equipment','FALSE','TRUE')) || '::text AS equipment,
            ' || quote_literal(colmodNew('FALSE','FALSE','FALSE','CENTER',200,'problemdescription','FALSE','TRUE')) || '::text AS problemdescription,
            ' || quote_literal(colmodNew('FALSE','FALSE','FALSE','CENTER',140,'tradename','FALSE','TRUE')) || '::text AS tradename,
            ' || quote_literal(colmodNew('FALSE','FALSE','FALSE','CENTER',120,'startdate','FALSE','TRUE')) || '::text AS startdate,
            ' || quote_literal(colmodNew('FALSE','FALSE','FALSE','CENTER',120,'enddate','FALSE','TRUE')) || '::text AS enddate,
            ' || quote_literal(colmodNew('FALSE','FALSE','FALSE','CENTER',140,'bookedby','FALSE','FALSE')) || '::text AS bookedby,
            ' || quote_literal(colmodNew('FALSE','FALSE','FALSE','CENTER',120,'wono','FALSE','FALSE')) || '::text AS wono,
            ' || quote_literal(colmodNew('TRUE','FALSE','FALSE','CENTER',0,'machineid','FALSE','TRUE')) || '::text AS machineid,
            ' || quote_literal(colmodNew('TRUE','FALSE','FALSE','CENTER',0,'flid','FALSE','TRUE')) || '::text AS flid,
            ' || quote_literal(colmodNew('TRUE','FALSE','FALSE','CENTER',0,'sectionid','FALSE','TRUE')) || '::text AS sectionid,
            ' || quote_literal(colmodNew('TRUE','FALSE','FALSE','CENTER',0,'status','FALSE','TRUE')) || '::text AS status

        UNION ALL

        SELECT
        2 as dataorder,
            ''BDMSKEYID'' AS bdmskeyid,
            ''Equipment'' AS equipment,
            ''Problem Description'' AS problemdescription,
            ''Maint. Section'' AS tradename,
            ''Start Date / Time'' AS startdate,
            ''End Date / Time'' AS enddate,
            ''Booked By'' AS bookedby,
            ''Work Order No'' AS wono,
            ''MachineId'' AS machineid,
            ''Flid'' AS flid,
            ''SectionId'' AS sectionid,
            ''Status'' AS status

        UNION ALL

        SELECT
        3 as dataorder,
            ''1'' AS bdmskeyid,
            ''2'' AS equipment,
            ''3'' AS problemdescription,
            ''4'' AS tradename,
            ''5'' AS startdate,
            ''6'' AS enddate,
            ''7'' AS bookedby,
            ''8'' AS wono,
            ''9'' AS machineid,
            ''10'' AS flid,
            ''11'' AS sectionid,
            ''12'' AS status

        UNION ALL ' || v_sqlstr;

    PERFORM gen_fn_adddebugsql(
        v_sqlstr,
        'BDM_PC_BREAKDOWNCOMPLETION',
        'BDM_FN_BREAKDOWNCOMPLETION_RN_SB'
    );

    EXECUTE 'SELECT count(*) FROM (' || v_sqlstr || ') cnt_wrap'
    INTO total_count;

    OPEN curbdm FOR EXECUTE v_sqlstr;
    RETURN;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE
            'Error in BDM_FN_BREAKDOWNCOMPLETION_RN_SB: % (SQLSTATE %)',
            SQLERRM,
            SQLSTATE;
        total_count := -1;
        curbdm := NULL;
        RETURN;
END;
$BODY$;

ALTER FUNCTION public.bdm_fn_breakdowncompletion_rn_sb(text, text)
    OWNER TO campuser;

GRANT EXECUTE ON FUNCTION public.bdm_fn_breakdowncompletion_rn_sb(text, text) TO PUBLIC;
