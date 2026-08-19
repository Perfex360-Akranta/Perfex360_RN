import React, { useCallback, useEffect, useState, } from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { loadDmtDashboard } from '../../services/api/dashboardApi';

import AbnormalityClosureChart from '../../components/dashboard/AbnormalityClosureChart';
import LossTrendChart from '../../components/dashboard/LossTrendChart';
import LossContributionChart  from '../../components/dashboard/LossContributionChart';
import ActionPlanClosureChart from '../../components/dashboard/ActionPlanClosureChart';
import AttendanceGauge from '../../components/dashboard/AttendanceGauge';
import DashboardMetricCard from '../../components/dashboard/DashboardMetricCard';
import AttendanceHalfGauge from '../../components/dashboard/AttendenceHalfGauge';
import KaizenBenefitChart from '../../components/dashboard/KaizenBenefitTrendChart';
import { useGrid } from '../../context/GridProvider';
import DashboardFooter from '../../components/dashboard/DashboardFooter';

interface DashboardData {
  levelCounts: any;
  employeeCount: any;
  transactionSummary: any;
  trainingSummary: any;
  abnormalityClosure: any;
  lossAnalysis: any;
  actionPlanClosure: any;
  attendanceGauge: any;
  kaizenBenefitTrend: any;
}

interface DashboardParams {
    flid :string;
    fromDate : Date ;
    toDate : Date ;
}

const DmtDashboardScreen = () => {
const {  currentRole} = useGrid();
  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

    //const [filter ,setFilter] =  useState<DashboardParams>({});

    const today = new Date();

const currentYear = today.getFullYear();
const currentMonth = today.getMonth(); // Jan=0, Apr=3

// Financial year starts in April
const financialYear =
  currentMonth >= 3 ? currentYear : currentYear - 1;

// Start of Financial Year → 01-Apr
const fromMonth = new Date(
  financialYear,
  3,
  1
);

// Last day of current month
const toMonth = new Date(
  currentYear,
  currentMonth + 1,
  0
);
const formatDate = (date: Date) => {
   

    return `${String(date.getDate()).padStart(
      2,
      '0',
    )}-${date.getMonth()}-${date.getFullYear()}`;
  };
    const [filter, setFilter] = useState<DashboardParams>({
    flid : currentRole.flid ?? '',
    fromDate: fromMonth,
  toDate: toMonth,
});


//   const [flid] = useState(currentRole.flid ?? '');

//   const [fromDate] = useState(
//     '2026-04-01',
//   );

//   const [toDate] = useState(
//     '2026-08-09',
//   );

  const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

  const loadDashboard = useCallback(
    async () => {

      try {
        const flid = filter.flid ;
const fromDate = formatDateForApi(filter.fromDate);
const toDate = formatDateForApi(filter.toDate);
        const result =
          await loadDmtDashboard({ flid,fromDate,toDate});

        console.log(
          'DMT DASHBOARD:',
          JSON.stringify(result, null, 2),
        );

        setDashboard(result);

      } catch (error) {

        console.error(
          'DMT Dashboard Error:',
          error,
        );

      } finally {

        setLoading(false);
        setRefreshing(false);
      }

    },
    [filter],
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onRefresh = () => {

    setRefreshing(true);

    loadDashboard();
  };

  if (loading) {

    return (
      <View style={styles.loadingContainer}>

        <ActivityIndicator
          size="large"
        />

        <Text style={styles.loadingText}>
          Loading dashboard...
        </Text>

      </View>
    );
  }

  if (!dashboard) {

    return (
      <View style={styles.loadingContainer}>

        <Text>
          Unable to load dashboard
        </Text>

      </View>
    );
  }

  return (

    <View style={styles.screen}>
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }>

      {/* HEADER */}

      <View style={styles.header}>

        <Text style={styles.title}>
         Dashboard
        </Text>

        <Text style={styles.subtitle}>
          {dashboard.levelCounts.currentLevel} - {dashboard.levelCounts.currentDisplayCode}
        </Text>

      </View>

      {/* KPI CARDS */}

      <View style={styles.cardGrid}>

         {dashboard?.levelCounts?.metrics
    ?.filter((metric: any) => metric.visible)
    .map((metric: any) => (

      <DashboardMetricCard
        key={metric.id}
        metric={metric}
      />

    ))}

    <DashboardMetricCard
         metric={{ ... dashboard.employeeCount,
          value : dashboard.employeeCount.employeeCount
         }}
        
      />

        {/* <DashboardCard
          title="EMPLOYEES"
          value={
            dashboard.employeeCount?.employeeCount
          }
          description="active employees"
        /> */}

 <DashboardMetricCard
         metric={{ 
          value : dashboard.transactionSummary
              ?.totalTransactions,
          title:'TRANSACTIONS',
          visible:true,
          variant:'blue',
          subtitle:'Total TPM Records',
          levelCode:dashboard.levelCounts.currentLevel,
          id:'TRANSACTIONS'
         }}
        
      />
        {/* <DashboardCard
          title="TRANSACTIONS"
          value={
            dashboard.transactionSummary
              ?.totalTransactions
          }
          description="total TPM records"
        /> */}

<DashboardMetricCard
         metric={{ 
          value : dashboard.transactionSummary?.suggestions,
          title:'SUGGESTIONS',
          visible:true,
          variant:'purple',
          subtitle:'ideas captured',
          levelCode:dashboard.levelCounts.currentLevel,
          id:'SUGGESTIONS'
         }}
        
      />
        {/* <DashboardCard
          title="SUGGESTIONS"
          value={
            dashboard.transactionSummary
              ?.suggestions
          }
          description="ideas captured"
        /> */}

<DashboardMetricCard
         metric={{ 
          value : dashboard.transactionSummary?.kaizens,
          title:'KAIZENS',
          visible:true,
          variant:'green',
          subtitle:'improvements captured',
          levelCode:dashboard.levelCounts.currentLevel,
          id:'KAIZENS'
         }}
           />
        {/* <DashboardCard
          title="KAIZENS"
          value={
            dashboard.transactionSummary
              ?.kaizens
          }
          description="improvements captured"
        /> */}


<DashboardMetricCard
         metric={{ 
          value :`${dashboard.transactionSummary?.abnormalitiesClosed ?? 0}/${dashboard.transactionSummary?.abnormalities ?? 0}`,
          title:'ABNORMALITIES',
          visible:true,
          variant:'red',
          subtitle:'closed / identified',
          levelCode:dashboard.levelCounts.currentLevel,
          id:'ABNORMALITIES'
         }}
           />
        {/* <DashboardCard
          title="ABNORMALITIES"
          value={
            dashboard.transactionSummary
              ?.abnormalities
          }
          description="closed / identified"
        /> */}
<DashboardMetricCard
         metric={{ 
          value :`${dashboard.transactionSummary?.actionPlans ?? 0}`,
          title:'ACTION PLANS',
          visible:true,
          variant:'orange',
          subtitle:'total action plans',
          levelCode:dashboard.levelCounts.currentLevel,
          id:'ACTIONPLANS'
         }}
           />
        {/* <DashboardCard
          title="ACTION PLANS"
          value={
            dashboard.transactionSummary
              ?.actionPlans
          }
          description="total action plans"
        /> */}

<DashboardMetricCard
         metric={{ 
          value :`${dashboard.transactionSummary?.meetings ?? 0}`,
          title:'MEETINGS',
          visible:true,
          variant:'cyan',
          subtitle:'meetings conducted',
          levelCode:dashboard.levelCounts.currentLevel,
          id:'MEETINGS'
         }}
           />
        {/* <DashboardCard
          title="MEETINGS"
          value={
            dashboard.transactionSummary
              ?.meetings
          }
          description="meetings conducted"
        /> */}

<DashboardMetricCard
         metric={{ 
          value :`${dashboard.trainingSummary?.completionPercentage ?? 0} %`,
          title:'TRAINING',
          visible:true,
          variant:'green',
          subtitle:'training completed',
          levelCode:dashboard.levelCounts.currentLevel,
          id:'TRAINING'
         }}
           />
        {/* <DashboardCard
          title="TRAINING"
          value={
            dashboard.trainingSummary
              ?.completionPercentage
          }
          description="training completed"
        /> */}

      </View>

      {/* CHARTS */}

      <AbnormalityClosureChart
        data={
          dashboard.abnormalityClosure
        }
      />

      <LossTrendChart
        data={
          dashboard.lossAnalysis
        }
      />

       <LossContributionChart
        data={
          dashboard.lossAnalysis
        }
      /> 

       <ActionPlanClosureChart
        data={
          dashboard.actionPlanClosure
        }
      /> 

      <AttendanceGauge
        data={
          dashboard.attendanceGauge
        }
      />

      <AttendanceHalfGauge
        data={
          dashboard.attendanceGauge
        }
      />

       <KaizenBenefitChart
        data={
          dashboard.kaizenBenefitTrend
        }
      /> 

     
    </ScrollView>

    <View style={styles.footerContainer}>
      <DashboardFooter filter={filter} onFilterChange={(filter:DashboardParams)=>{
        setFilter(filter);
      }} />
    </View>

    </View>
  );
};

const DashboardCard = ({
  title,
  value,
  description,
}: any) => {

  return (
    <View style={styles.dashboardCard}>

      <Text style={styles.cardTitle}>
        {title}
      </Text>

      <Text style={styles.cardValue}>
        {value ?? 0}
      </Text>

      <Text style={styles.cardDescription}>
        {description}
      </Text>

    </View>
  );
};

const styles = StyleSheet.create({


  screen: {
    flex: 1,
    backgroundColor: '#eaf6fc',
  },
  container: {
    flex: 1,
    backgroundColor: '#eaf6fc',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
  },

  header: {
    margin: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#b5d8ef',
    borderRadius: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#003b69',
  },

  subtitle: {
    marginTop: 4,
    color: '#39709b',
  },

  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 6,
  },

  dashboardCard: {
    width: '48%',
    margin: '1%',
    padding: 14,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#b8d9ee',
    elevation: 3,
  },

  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#003b69',
  },

  cardValue: {
    marginTop: 8,
    fontSize: 27,
    fontWeight: '800',
    color: '#087db4',
  },

  cardDescription: {
    marginTop: 4,
    fontSize: 12,
    color: '#35617f',
  },
  footerContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#b5d8ef',
    elevation: 0,
    paddingBottom: 0,
  },

});

export default DmtDashboardScreen;