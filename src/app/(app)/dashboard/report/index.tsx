/**
 * dashboard/report/index.tsx — Reports screen (READ-ONLY).
 *
 * Hiển thị 6 sections trong 1 ScrollView:
 *  1. Header + range selector (7d / 30d / thisMonth)
 *  2. Overview stat cards (5 số liệu tổng quan)
 *  3. Revenue chart (bar chart thuần View heights)
 *  4. Best selling table (top 5 sản phẩm)
 *  5. Inventory summary (tổng + low stock list + by category)
 *  6. Debt summary (tổng + danh sách khách nợ)
 *
 * Mỗi section có try/catch riêng → 1 phần fail không crash toàn màn hình.
 */
import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  useOverviewQuery,
  useRevenueQuery,
  useBestSellingQuery,
  useInventoryQuery,
  useDebtQuery,
} from '@/hooks/use-reports'
import type {
  RevenueRange,
  ReportOverviewResponse,
  RevenueReportResponse,
  RevenueDailyPoint,
  BestSellingReportResponse,
  InventoryReportResponse,
  DebtReportResponse,
  CategoryCount,
  CustomerDebt,
  LowStockProduct,
} from '@/types/report'

const RANGES: RevenueRange[] = ['7d', '30d', 'thisMonth']

export default function ReportIndex() {
  const { t } = useTranslation()
  const [range, setRange] = useState<RevenueRange>('30d')

  const overviewQ = useOverviewQuery()
  const revenueQ = useRevenueQuery(range)
  const bestSellingQ = useBestSellingQuery(5)
  const inventoryQ = useInventoryQuery()
  const debtQ = useDebtQuery()

  const isRefreshing =
    overviewQ.isRefetching ||
    revenueQ.isRefetching ||
    bestSellingQ.isRefetching ||
    inventoryQ.isRefetching ||
    debtQ.isRefetching

  const onRefresh = () => {
    overviewQ.refetch()
    revenueQ.refetch()
    bestSellingQ.refetch()
    inventoryQ.refetch()
    debtQ.refetch()
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor="#7c3aed"
          colors={['#7c3aed']}
        />
      }
    >
      {/* Header + range selector */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('report.title')}</Text>
        <View style={styles.rangeRow}>
          {RANGES.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.rangeBtn, range === r && styles.rangeBtnActive]}
              onPress={() => setRange(r)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.rangeBtnText,
                  range === r && styles.rangeBtnTextActive,
                ]}
              >
                {r === '7d'
                  ? t('report.range7d')
                  : r === '30d'
                    ? t('report.range30d')
                    : t('report.rangeThisMonth')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Overview stat cards */}
      <Section title={t('report.overview')}>
        <OverviewSection query={overviewQ} />
      </Section>

      {/* Revenue chart */}
      <Section title={t('report.revenueChart')}>
        <RevenueChartSection query={revenueQ} range={range} />
      </Section>

      {/* Best selling */}
      <Section title={t('report.bestSelling')}>
        <BestSellingSection query={bestSellingQ} />
      </Section>

      {/* Inventory summary */}
      <Section title={t('report.inventory')}>
        <InventorySection query={inventoryQ} />
      </Section>

      {/* Debt summary */}
      <Section title={t('report.debt')}>
        <DebtSection query={debtQ} />
      </Section>

      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

// ── Sub-components ──

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

function ErrorBlock({ message }: { message: string }) {
  return <Text style={styles.errorText}>{message}</Text>
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

// ── Sections ──

function OverviewSection({
  query,
}: {
  query: ReturnType<typeof useOverviewQuery>
}) {
  const { t } = useTranslation()
  if (query.isLoading) {
    return <ActivityIndicator color="#7c3aed" style={{ paddingVertical: 12 }} />
  }
  if (query.isError) {
    return <ErrorBlock message={t('report.failedToLoad')} />
  }
  const data = query.data?.data as ReportOverviewResponse | undefined
  if (!data) {
    return <ErrorBlock message={t('report.noData')} />
  }

  const stats: Array<{ label: string; value: string; highlight?: boolean }> = [
    { label: t('report.totalProducts'), value: data.totalProducts.toString() },
    {
      label: t('report.ordersThisMonth'),
      value: data.ordersThisMonth.toString(),
    },
    {
      label: t('report.revenueThisMonth'),
      value: `${data.revenueThisMonth.toLocaleString()} đ`,
      highlight: true,
    },
    {
      label: t('report.totalCustomers'),
      value: data.totalCustomers.toString(),
    },
    {
      label: t('report.lowStockCount'),
      value: data.lowStockCount.toString(),
      highlight: data.lowStockCount > 0,
    },
  ]

  return (
    <View style={styles.statGrid}>
      {stats.map((s) => (
        <View
          key={s.label}
          style={[styles.statCard, s.highlight && styles.statCardHighlight]}
        >
          <Text style={styles.statValue}>{s.value}</Text>
          <Text style={styles.statLabel}>{s.label}</Text>
        </View>
      ))}
    </View>
  )
}

function RevenueChartSection({
  query,
  range,
}: {
  query: ReturnType<typeof useRevenueQuery>
  range: RevenueRange
}) {
  const { t } = useTranslation()
  if (query.isLoading) {
    return <ActivityIndicator color="#7c3aed" style={{ paddingVertical: 12 }} />
  }
  if (query.isError) {
    return <ErrorBlock message={t('report.failedToLoad')} />
  }
  const data = query.data?.data as RevenueReportResponse | undefined
  if (!data || data.points.length === 0) {
    return <Text style={styles.emptyText}>{t('report.noData')}</Text>
  }

  const maxRevenue = data.points.reduce(
    (acc: number, p: RevenueDailyPoint) => (p.revenue > acc ? p.revenue : acc),
    0,
  )

  return (
    <View>
      <View style={styles.totalRevenueRow}>
        <Text style={styles.totalRevenueLabel}>{t('report.totalRevenue')}</Text>
        <Text style={styles.totalRevenueValue}>
          {data.total.toLocaleString()} đ
        </Text>
      </View>

      <Text style={styles.periodText}>
        {new Date(data.periodStart).toLocaleDateString('vi-VN')} →{' '}
        {new Date(data.periodEnd).toLocaleDateString('vi-VN')}
      </Text>

      <View style={styles.chartContainer}>
        <View style={styles.chartBars}>
          {data.points.map((p: RevenueDailyPoint, idx: number) => {
            const safeMax = maxRevenue > 0 ? maxRevenue : 1
            const heightPct =
              safeMax > 0 ? (p.revenue / safeMax) * 100 : 0
            return (
              <View key={`${p.date}-${idx}`} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${heightPct}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            )
          })}
        </View>
      </View>

      <View style={styles.chartLabels}>
        {data.points.map((p: RevenueDailyPoint, idx: number) => {
          const showLabel =
            data.points.length <= 10 ||
            idx === 0 ||
            idx === data.points.length - 1 ||
            idx % Math.ceil(data.points.length / 6) === 0
          return (
            <View key={`label-${p.date}-${idx}`} style={styles.barColumn}>
              {showLabel ? (
                <Text style={styles.chartLabel}>
                  {new Date(p.date).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </Text>
              ) : (
                <Text style={styles.chartLabel}> </Text>
              )}
            </View>
          )
        })}
      </View>
    </View>
  )
}

function BestSellingSection({
  query,
}: {
  query: ReturnType<typeof useBestSellingQuery>
}) {
  const { t } = useTranslation()
  if (query.isLoading) {
    return <ActivityIndicator color="#7c3aed" style={{ paddingVertical: 12 }} />
  }
  if (query.isError) {
    return <ErrorBlock message={t('report.failedToLoad')} />
  }
  const data = query.data?.data as BestSellingReportResponse | undefined
  if (!data || data.products.length === 0) {
    return <Text style={styles.emptyText}>{t('report.noData')}</Text>
  }

  return (
    <View>
      {/* Header row */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.colRank]}>#</Text>
        <Text style={[styles.tableHeaderText, styles.colName]}>
          {t('report.productName')}
        </Text>
        <Text style={[styles.tableHeaderText, styles.colQty]}>
          {t('report.quantitySold')}
        </Text>
        <Text style={[styles.tableHeaderText, styles.colRevenue]}>
          {t('report.revenue')}
        </Text>
      </View>

      {data.products.map((p, idx) => (
        <View key={p.productId} style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.colRank]}>{idx + 1}</Text>
          <Text
            style={[styles.tableCell, styles.colName]}
            numberOfLines={1}
          >
            {p.productName}
          </Text>
          <Text style={[styles.tableCell, styles.colQty]}>{p.quantitySold}</Text>
          <Text style={[styles.tableCell, styles.colRevenue]}>
            {p.revenue.toLocaleString()} đ
          </Text>
        </View>
      ))}
    </View>
  )
}

function InventorySection({
  query,
}: {
  query: ReturnType<typeof useInventoryQuery>
}) {
  const { t } = useTranslation()
  if (query.isLoading) {
    return <ActivityIndicator color="#7c3aed" style={{ paddingVertical: 12 }} />
  }
  if (query.isError) {
    return <ErrorBlock message={t('report.failedToLoad')} />
  }
  const data = query.data?.data as InventoryReportResponse | undefined
  if (!data) {
    return <Text style={styles.emptyText}>{t('report.noData')}</Text>
  }

  return (
    <View>
      <InfoRow
        label={t('report.totalProducts')}
        value={data.totalProducts.toString()}
      />
      <InfoRow
        label={t('report.totalValue')}
        value={`${data.totalValue.toLocaleString()} đ`}
      />

      {/* Low stock alert list */}
      <Text style={styles.subSectionTitle}>{t('report.lowStockAlert')}</Text>
      {data.lowStockProducts.length === 0 ? (
        <Text style={styles.emptyText}>{t('report.noData')}</Text>
      ) : (
        data.lowStockProducts.map((p: LowStockProduct) => (
          <View key={p.productId} style={styles.lowStockRow}>
            <Text style={styles.lowStockName} numberOfLines={1}>
              {p.productName}
            </Text>
            <Text style={styles.lowStockValue}>
              {t('report.stockVsMin', { stock: p.stock, min: p.minStock })}
            </Text>
          </View>
        ))
      )}

      {/* By category */}
      <Text style={styles.subSectionTitle}>{t('report.byCategory')}</Text>
      {data.byCategory.length === 0 ? (
        <Text style={styles.emptyText}>{t('report.noData')}</Text>
      ) : (
        data.byCategory.map((c: CategoryCount, idx: number) => (
          <InfoRow
            key={`${c.categoryName ?? 'none'}-${idx}`}
            label={c.categoryName ?? '—'}
            value={c.count.toString()}
          />
        ))
      )}
    </View>
  )
}

function DebtSection({
  query,
}: {
  query: ReturnType<typeof useDebtQuery>
}) {
  const { t } = useTranslation()
  if (query.isLoading) {
    return <ActivityIndicator color="#7c3aed" style={{ paddingVertical: 12 }} />
  }
  if (query.isError) {
    return <ErrorBlock message={t('report.failedToLoad')} />
  }
  const data = query.data?.data as DebtReportResponse | undefined
  if (!data) {
    return <Text style={styles.emptyText}>{t('report.noData')}</Text>
  }

  return (
    <View>
      <View style={styles.debtTotalRow}>
        <Text style={styles.debtTotalLabel}>{t('report.totalDebt')}</Text>
        <Text style={styles.debtTotalValue}>
          {data.totalDebt.toLocaleString()} đ
        </Text>
      </View>

      {data.customers.length === 0 ? (
        <Text style={styles.emptyText}>{t('report.noData')}</Text>
      ) : (
        data.customers.map((c: CustomerDebt, idx: number) => (
          <View key={`${c.customerId ?? 'walkin'}-${idx}`} style={styles.debtRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.debtName} numberOfLines={1}>
                {c.customerName}
              </Text>
              <Text style={styles.debtMeta}>
                {t('report.orderCount', { count: c.orderCount })}
              </Text>
            </View>
            <Text style={styles.debtAmount}>
              {c.totalDebt.toLocaleString()} đ
            </Text>
          </View>
        ))
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  // Header
  header: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 14,
  },
  rangeRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    padding: 4,
  },
  rangeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  rangeBtnActive: { backgroundColor: '#fff' },
  rangeBtnText: { fontSize: 13, color: '#fff', fontWeight: '500' },
  rangeBtnTextActive: { color: '#7c3aed', fontWeight: '700' },

  // Card
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginTop: 14,
    marginBottom: 6,
  },

  // Stat grid (overview)
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#faf5ff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ede9fe',
  },
  statCardHighlight: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7c3aed',
    marginBottom: 4,
  },
  statLabel: { fontSize: 11, color: '#6b7280', fontWeight: '500' },

  // Info row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: { fontSize: 13, color: '#888' },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },

  // Revenue chart
  totalRevenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  totalRevenueLabel: { fontSize: 13, color: '#888' },
  totalRevenueValue: { fontSize: 18, fontWeight: '700', color: '#7c3aed' },
  periodText: { fontSize: 11, color: '#999', marginBottom: 12 },
  chartContainer: {
    height: 140,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  barColumn: { flex: 1, alignItems: 'center', paddingHorizontal: 1 },
  barTrack: {
    width: '70%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: '#7c3aed',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    minHeight: 2,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  chartLabel: {
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
  },

  // Table (best selling)
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableHeaderText: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  tableCell: { fontSize: 13, color: '#333' },
  colRank: { width: 28, textAlign: 'center' },
  colName: { flex: 1, paddingHorizontal: 6 },
  colQty: { width: 50, textAlign: 'right' },
  colRevenue: { width: 90, textAlign: 'right', fontWeight: '600' },

  // Low stock
  lowStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#fef3c7',
  },
  lowStockName: { fontSize: 13, color: '#333', flex: 1 },
  lowStockValue: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },

  // Debt
  debtTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#fee2e2',
  },
  debtTotalLabel: { fontSize: 14, color: '#666', fontWeight: '600' },
  debtTotalValue: { fontSize: 20, fontWeight: '700', color: '#dc2626' },
  debtRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  debtName: { fontSize: 14, color: '#333', fontWeight: '500' },
  debtMeta: { fontSize: 11, color: '#888', marginTop: 2 },
  debtAmount: { fontSize: 14, fontWeight: '600', color: '#dc2626' },

  // States
  emptyText: { fontSize: 13, color: '#888', fontStyle: 'italic', paddingVertical: 4 },
  errorText: { fontSize: 13, color: '#dc2626', paddingVertical: 4 },
})
