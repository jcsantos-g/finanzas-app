import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  Card,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  ProgressBar,
  ScreenContainer,
} from '@/components/ui';
import { Palette } from '@/constants/theme';
import { formatCurrency } from '@/lib/formatters';
import { useTheme } from '@/hooks/use-theme';
import type { TipoMovimiento } from '@/types/database';

import type { CategoryReport } from './service';
import { useReports } from './useReports';

type Period = { year: number; month: number };

export function ReportsScreen() {
  const [period, setPeriod] = useState<Period>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const theme = useTheme();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const canGoNext =
    period.year < currentYear || (period.year === currentYear && period.month < currentMonth);
  const monthLabel = new Intl.DateTimeFormat('es-MX', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(period.year, period.month - 1, 1));

  const changeMonth = (direction: -1 | 1) => {
    setPeriod((current) => {
      const next = new Date(current.year, current.month - 1 + direction, 1);
      const nextPeriod = { year: next.getFullYear(), month: next.getMonth() + 1 };
      const isFuture =
        nextPeriod.year > currentYear ||
        (nextPeriod.year === currentYear && nextPeriod.month > currentMonth);

      return direction === 1 && isFuture ? current : nextPeriod;
    });
  };

  return (
    <ScreenContainer scroll>
      <ThemedText type="title">Reportes</ThemedText>

      <View style={styles.monthSelector}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mes anterior"
          onPress={() => changeMonth(-1)}
          style={({ pressed }) => [
            styles.monthButton,
            {
              backgroundColor: theme.backgroundElement,
              opacity: pressed ? 0.75 : 1,
            },
          ]}>
          <Icon name="chevron-left" />
        </Pressable>
        <ThemedText type="smallBold" style={styles.monthLabel}>
          {monthLabel}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mes siguiente"
          accessibilityState={{ disabled: !canGoNext }}
          disabled={!canGoNext}
          onPress={() => changeMonth(1)}
          style={({ pressed }) => [
            styles.monthButton,
            {
              backgroundColor: theme.backgroundElement,
              opacity: !canGoNext ? 0.45 : pressed ? 0.75 : 1,
            },
          ]}>
          <Icon name="chevron-right" />
        </Pressable>
      </View>

      <MonthlyReportContent key={`${period.year}-${period.month}`} {...period} />
    </ScreenContainer>
  );
}

function MonthlyReportContent({ year, month }: Period) {
  const { report, loading, error, reload } = useReports(year, month);
  const theme = useTheme();

  if (loading) {
    return <LoadingState message="Cargando reporte..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void reload()} />;
  }

  if (!report) {
    return (
      <ErrorState
        message="No se pudo cargar el reporte."
        onRetry={() => void reload()}
      />
    );
  }

  const gastos = report.porCategoria.filter(({ tipo }) => tipo === 'gasto');
  const ingresos = report.porCategoria.filter(({ tipo }) => tipo === 'ingreso');
  const maxCategoryTotal = report.porCategoria.reduce(
    (max, category) => Math.max(max, category.total),
    0,
  );
  const balanceColor =
    report.balance > 0
      ? Palette.success
      : report.balance < 0
        ? Palette.danger
        : theme.textSecondary;

  return (
    <>
      <Card>
        <ThemedText type="small">Balance mensual</ThemedText>
        <ThemedText type="subtitle" style={{ color: balanceColor }}>
          {formatCurrency(report.balance)}
        </ThemedText>
      </Card>

      <View style={styles.summaryGrid}>
        <Card style={styles.summaryCard}>
          <ThemedText type="small">Ingresos</ThemedText>
          <ThemedText
            type="smallBold"
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ color: Palette.success }}>
            {formatCurrency(report.totalIngresos)}
          </ThemedText>
        </Card>
        <Card style={styles.summaryCard}>
          <ThemedText type="small">Gastos</ThemedText>
          <ThemedText
            type="smallBold"
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ color: Palette.danger }}>
            {formatCurrency(report.totalGastos)}
          </ThemedText>
        </Card>
      </View>

      {report.porCategoria.length === 0 ? (
        <EmptyState message="No hay movimientos registrados en este mes." />
      ) : null}

      <CategorySection tipo="gasto" items={gastos} maxValue={maxCategoryTotal} />
      <CategorySection tipo="ingreso" items={ingresos} maxValue={maxCategoryTotal} />
    </>
  );
}

function CategorySection({
  tipo,
  items,
  maxValue,
}: {
  tipo: TipoMovimiento;
  items: CategoryReport[];
  maxValue: number;
}) {
  const title = tipo === 'gasto' ? 'Gastos por categoría' : 'Ingresos por categoría';
  const emptyMessage = tipo === 'gasto' ? 'No hay gastos en este mes.' : 'No hay ingresos en este mes.';
  const color = tipo === 'gasto' ? Palette.danger : Palette.success;

  return (
    <View style={styles.categorySection}>
      <ThemedText type="default" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      {items.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          {emptyMessage}
        </ThemedText>
      ) : (
        items.map((item) => (
          <Card key={`${item.tipo}:${item.categoria?.id ?? item.nombreCategoria}`} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <ThemedText type="smallBold" numberOfLines={1} style={styles.categoryName}>
                {item.nombreCategoria}
              </ThemedText>
              <ThemedText type="smallBold" numberOfLines={1} style={{ color }}>
                {formatCurrency(item.total)}
              </ThemedText>
            </View>
            <ProgressBar value={item.total} max={maxValue} color={color} />
          </Card>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  monthButton: {
    minWidth: 48,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    flex: 1,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    flexBasis: '45%',
    flexGrow: 1,
  },
  categorySection: {
    gap: 8,
  },
  categoryCard: {
    gap: 10,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryName: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: '700',
  },
});
