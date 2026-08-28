import { Text, View, StyleSheet } from 'react-native';
import { colors } from '../theme';
import type { Fulfillment, OrderStatus } from '../types';
import { clientTimeline, pickupTimeline } from '../lib/dashboard';
import { timelineReached } from '../lib/orderStatus';

export function OrderTimeline({
  status,
  fulfillment,
}: {
  status: OrderStatus;
  fulfillment: Fulfillment;
}) {
  const steps = fulfillment === 'delivery' ? clientTimeline : pickupTimeline;
  const reached = timelineReached({ status, fulfillment });
  return (
    <View>
      {steps.map((step, i) => {
        const done = i < reached;
        const current = i === reached - 1 || (i === 0 && reached === 1 && !done);
        const active = i < reached;
        return (
          <View key={step.label} style={s.row}>
            <View style={s.rail}>
              <View style={[s.dot, active && s.dotOn]}>
                {active ? <Text style={s.check}>✓</Text> : <Text style={s.empty}>○</Text>}
              </View>
              {i < steps.length - 1 ? <View style={[s.line, active && i < reached - 1 && s.lineOn]} /> : null}
            </View>
            <Text style={[s.label, active ? s.labelOn : s.labelOff, current && !active ? s.labelNow : null]}>
              {step.status === 'picked_up' && status === 'picked_up' ? '🚚 Livreur en route' : step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', minHeight: 44, alignItems: 'flex-start', gap: 12 },
  rail: { width: 28, alignItems: 'center' },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  dotOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  check: { color: '#fff', fontWeight: '900', fontSize: 12 },
  empty: { color: colors.muted, fontWeight: '800' },
  line: { width: 2, flex: 1, minHeight: 16, backgroundColor: colors.border },
  lineOn: { backgroundColor: colors.primary },
  label: { fontWeight: '800', fontSize: 15, paddingTop: 4, flex: 1 },
  labelOn: { color: colors.text },
  labelOff: { color: colors.muted },
  labelNow: { color: colors.primary },
});
