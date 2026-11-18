import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import FunctionalLocationFilter from './FunctionalLocationFilter';
import { get } from '../../services/axiosService';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useAppTheme } from '../../theme/ThemeContext';
import { useFeatureToggles } from '../../context/FeatureToggleContext';
import QrScanner from '../QRscanner/QrScanner';

interface FunctionalLocation {
  companyId: string;
  company?: string;
  locationId: string;
  location?: string;
  sbuId: string;
  sbu?: string;
  pbuId: string;
  pbu?: string;
  sectionId: string;
  section?: string;
  cellId: string;
  cell?: string;
  machineId: string;
  machine?: string;
  flid: string;
  elementId: string;
}

interface FunctionalLocationValidate {
  isCompany?: boolean;
  isLocation?: boolean;
  isSbu?: boolean;
  isPbu?: boolean;
  isSection?: boolean;
  isCell?: boolean;
  isMachine?: boolean;
}

interface FunctionalLocationViewProps {
  flid: string;
  visible?: boolean;
  onSelect?: (value: any) => void;
  validate?: FunctionalLocationValidate;
  onScannerVisibleChange?: (visible: boolean) => void;
}

// export interface FunctionalLocationScannerViewHandle {
//   openFunctionalLocation: () => void;
//   openQrScanner: () => void;
//   closeFunctionalLocation: () => void;
//   closeQrScanner: () => void;
// }
export interface FunctionalLocationScannerViewHandle {
  openFunctionalLocation: () => void;
  openQrScanner: () => void;
  closeFunctionalLocation: () => void;
  closeQrScanner: () => void;
  submitFunctionalLocation: () => string;
  isFunctionalLocationOpen: () => boolean;
  isQrScannerOpen: () => boolean;
}

const FunctionalLocationScannerView = forwardRef<
  FunctionalLocationScannerViewHandle,
  FunctionalLocationViewProps
>(function FunctionalLocationScannerView(
  { flid, visible, onSelect, validate, onScannerVisibleChange },
  ref,
) {
  const { colors } = useAppTheme();
  const { isFeatureEnabled } = useFeatureToggles();
  const qrScannerEnabled = isFeatureEnabled('qrScanner');
  const [showFunctionalLocation, setShowFunctionalLocation] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);

  const filterRef = useRef<any>(null);
  const functionalOpenRef = useRef(false);
  const scannerOpenRef = useRef(false);
  functionalOpenRef.current = showFunctionalLocation;
  scannerOpenRef.current = showQrScanner;


  const setScannerVisible = (show: boolean) => {
    if (show && !qrScannerEnabled) return;
    setShowQrScanner(show);
    onScannerVisibleChange?.(show);
  };

  // useImperativeHandle(ref, () => ({
  //   openFunctionalLocation: () => setShowFunctionalLocation(true),
  //   openQrScanner: () => setScannerVisible(true),
  //   closeFunctionalLocation: () => setShowFunctionalLocation(false),
  //   closeQrScanner: () => setScannerVisible(false),
  // }));
  useImperativeHandle(ref, () => ({
    openFunctionalLocation: () => {
      console.log('[FunctionalLocationScannerView] openFunctionalLocation called');
      setShowFunctionalLocation(true);
    },
    openQrScanner: () => {
      if (!qrScannerEnabled) return;
      console.log('[FunctionalLocationScannerView] openQrScanner called');
      setShowQrScanner(true);
    },
    closeFunctionalLocation: () => setShowFunctionalLocation(false),
    closeQrScanner: () => setShowQrScanner(false),
    submitFunctionalLocation: () =>
      filterRef.current?.submit?.() ?? 'Functional location is not open',
    isFunctionalLocationOpen: () => functionalOpenRef.current,
    isQrScannerOpen: () => scannerOpenRef.current,
  }));

  const [form, setForm] = useState<FunctionalLocation>({
    companyId: '',
    locationId: '',
    sbuId: '',
    pbuId: '',
    sectionId: '',
    cellId: '',
    machineId: '',
    flid: flid,
    elementId: '',
  });

  const handleQrScanned = (id: string) => {
    loadFunctionalLocation(id, undefined);
    console.log('Scanned QR ID:', id);
  };

  const loadFunctionalLocation = async (
    originalId?: string,
    flidParam?: string,
  ) => {
    try {
      const result = await get(
        'dropdown/functional-location/hierarchy',
        {
          flid: flidParam,
          originalId: originalId,
        },
      );
      if (onSelect) {
        onSelect(result);
      }

      setForm(prev => ({
        ...prev,
        companyId: result.companyId ?? '',
        company: result.companyLabel ?? '',
        locationId: result.locationId ?? '',
        location: result.locationLabel ?? '',
        sbuId: result.sbuId ?? '',
        sbu: result.sbuLabel ?? '',
        pbuId: result.pbuId ?? '',
        pbu: result.pbuLabel ?? '',
        sectionId: result.sectionId ?? '',
        section: result.sectionLabel ?? '',
        cellId: result.cellId ?? '',
        cell: result.cellLabel ?? '',
        machineId: result.machineId ?? '',
        machine: result.machineLabel ?? '',
        flid: result.flid ?? '',
        elementId: result.elementId ?? '',
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const FunctionalLocation_successCallback = async (result: any) => {
    try {
      if (onSelect) {
        onSelect(result);
      }

      setForm(prev => ({
        ...prev,
        companyId: result.companyId ?? '',
        company: result.companyLabel ?? '',
        locationId: result.locationId ?? '',
        location: result.locationLabel ?? '',
        sbuId: result.sbuId ?? '',
        sbu: result.sbuLabel ?? '',
        pbuId: result.pbuId ?? '',
        pbu: result.pbuLabel ?? '',
        sectionId: result.sectionId ?? '',
        section: result.sectionLabel ?? '',
        cellId: result.cellId ?? '',
        cell: result.cellLabel ?? '',
        machineId: result.machineId ?? '',
        machine: result.machineLabel ?? '',
        flid: result.flid ?? '',
        elementId: result.elementId ?? '',
      }));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (flid) {
      loadFunctionalLocation(undefined, flid);
    }
  }, [flid]);

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.label, { color: colors.text }]}>Functional Location</Text>

          <TouchableOpacity
            style={[styles.arrowButton, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}
            onPress={() => setShowFunctionalLocation(true)}
          >
            <MaterialIcons
              name="arrow-forward"
              size={20}
              color={colors.surface}
            />
          </TouchableOpacity>
        </View>

        {qrScannerEnabled && (
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TouchableOpacity
              style={[styles.scanButton, { backgroundColor: colors.primary }]}
              onPress={() => setScannerVisible(true)}
            >
              <MaterialIcons
                name="qr-code-scanner"
                size={20}
                color={colors.surface}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FunctionalLocationFilter
        ref={filterRef}
        flid={form.flid}
        visible={showFunctionalLocation}
        onClose={() => setShowFunctionalLocation(false)}
        onSelect={(value: any) => {
          FunctionalLocation_successCallback(value);
        }}
        validate={validate}
      />

      <QrScanner
        visible={qrScannerEnabled && showQrScanner}
        onScan={handleQrScanned}
        onClose={() => setScannerVisible(false)}
      />

      <View style={[styles.hierarchyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {form.company && (
          <TouchableOpacity onPress={() => setShowFunctionalLocation(true)}>
            <Text style={[styles.link, { color: colors.primary }]}>{form.company}</Text>
          </TouchableOpacity>
        )}

        {form.location && (
          <>
            <Text style={[styles.separator, { color: colors.textSecondary }]}> / </Text>
            <TouchableOpacity onPress={() => setShowFunctionalLocation(true)}>
              <Text style={[styles.link, { color: colors.primary }]}>{form.location}</Text>
            </TouchableOpacity>
          </>
        )}

        {form.sbu && (
          <>
            <Text style={[styles.separator, { color: colors.textSecondary }]}> / </Text>
            <TouchableOpacity onPress={() => setShowFunctionalLocation(true)}>
              <Text style={[styles.link, { color: colors.primary }]}>{form.sbu}</Text>
            </TouchableOpacity>
          </>
        )}

        {form.pbu && (
          <>
            <Text style={[styles.separator, { color: colors.textSecondary }]}> / </Text>
            <TouchableOpacity onPress={() => setShowFunctionalLocation(true)}>
              <Text style={[styles.link, { color: colors.primary }]}>{form.pbu}</Text>
            </TouchableOpacity>
          </>
        )}

        {form.section && (
          <>
            <Text style={[styles.separator, { color: colors.textSecondary }]}> / </Text>
            <TouchableOpacity onPress={() => setShowFunctionalLocation(true)}>
              <Text style={[styles.link, { color: colors.primary }]}>{form.section}</Text>
            </TouchableOpacity>
          </>
        )}

        {form.cell && (
          <>
            <Text style={[styles.separator, { color: colors.textSecondary }]}> / </Text>
            <TouchableOpacity onPress={() => setShowFunctionalLocation(true)}>
              <Text style={[styles.link, { color: colors.primary }]}>{form.cell}</Text>
            </TouchableOpacity>
          </>
        )}

        {form.machine && (
          <>
            <Text style={[styles.separator, { color: colors.textSecondary }]}> / </Text>
            <TouchableOpacity onPress={() => setShowFunctionalLocation(true)}>
              <Text style={[styles.link, { color: colors.primary }]}>{form.machine}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
});

export default FunctionalLocationScannerView;

const styles = StyleSheet.create({
  arrowButton: {
    width: 25,
    height: 25,
    marginLeft: 5,
    borderRadius: 10,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  hierarchyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  link: {
    color: '#1976D2',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  separator: {
    color: '#666',
    marginHorizontal: 3,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  fieldContainer: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 0,
    fontWeight: '600',
  },
  dropdown: {
    height: 40,
    borderWidth: 1,
    borderColor: '#4aa3df',
    borderRadius: 3,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  placeholderStyle: {
    fontSize: 13,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 13,
    color: '#000',
  },
  itemTextStyle: {
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    borderRadius: 5,
    padding: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  button: {
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    elevation: 2,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 10,
  },
  closeText: {
    fontSize: 18,
    color: 'red',
    fontWeight: 'bold',
  },
  scanButton: {
    width: 25,
    height: 25,
    borderRadius: 5,
    backgroundColor: '#0D5DB8',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    marginRight: 10,
  },
});
