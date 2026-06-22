/**
 * BarcodeScannerModal.tsx — Barcode scanner using expo-camera CameraView.
 *
 * Modal overlay với camera full-screen, scans barcode, returns value qua onScanned.
 *
 * Props:
 * - visible: boolean
 * - onScanned: (barcode: string) => void
 * - onClose: () => void
 */
import { useEffect, useState } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useTranslation } from 'react-i18next'
import type { BarcodeScanningResult } from 'expo-camera'

interface Props {
  visible: boolean
  onScanned: (barcode: string) => void
  onClose: () => void
}

const BARCODE_TYPES = ['ean13', 'code128', 'code39', 'upc_a', 'upc_e', 'qr'] as const

export function BarcodeScannerModal({ visible, onScanned, onClose }: Props) {
  const { t } = useTranslation()
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    if (visible && permission && !permission.granted && permission.canAskAgain) {
      requestPermission()
    }
    if (visible) {
      setScanned(false)
    }
  }, [visible, permission, requestPermission])

  const handleScanned = (result: BarcodeScanningResult) => {
    if (scanned) return
    setScanned(true)
    onScanned(result.data)
  }

  const handleRescan = () => setScanned(false)

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {!permission ? (
          <View style={styles.center}>
            <ActivityIndicator color="#fff" />
          </View>
        ) : !permission.granted ? (
          <View style={styles.center}>
            <Text style={styles.permissionText}>
              {t('product.create.scanPermissionDenied')}
            </Text>
            <TouchableOpacity
              style={styles.permissionBtn}
              onPress={requestPermission}
            >
              <Text style={styles.permissionBtnText}>
                {t('product.create.scanGrantPermission')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.permissionBtn, styles.closeBtn]}
              onPress={onClose}
            >
              <Text style={styles.permissionBtnText}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: [...BARCODE_TYPES],
              }}
              onBarcodeScanned={handleScanned}
            />

            <View style={styles.overlay} pointerEvents="box-none">
              <View style={styles.topBar}>
                <View style={styles.topBarSpacer} />
                <Text style={styles.title}>{t('product.create.scanBarcode')}</Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  accessibilityLabel={t('common.cancel')}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.centerArea} pointerEvents="none">
                <View style={styles.reticle} />
              </View>

              {scanned && (
                <View style={styles.bottomBar}>
                  <TouchableOpacity
                    style={styles.rescanBtn}
                    onPress={handleRescan}
                  >
                    <Text style={styles.rescanBtnText}>
                      {t('product.create.scanAgain')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  permissionText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
  },
  permissionBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  permissionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  topBarSpacer: {
    width: 40,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticle: {
    width: 260,
    height: 160,
    borderWidth: 3,
    borderColor: '#7c3aed',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  bottomBar: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  rescanBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  rescanBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
})
