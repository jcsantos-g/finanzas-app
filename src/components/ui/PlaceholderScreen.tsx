import { ThemedText } from '@/components/themed-text';

import { ScreenContainer } from './ScreenContainer';

/** Pantalla temporal. Cada integrante la reemplaza por la pantalla real de su módulo. */
export function PlaceholderScreen({ title, owner }: { title: string; owner: string }) {
  return (
    <ScreenContainer>
      <ThemedText type="title">{title}</ThemedText>
      <ThemedText themeColor="textSecondary">Pendiente de implementar — {owner}</ThemedText>
    </ScreenContainer>
  );
}
