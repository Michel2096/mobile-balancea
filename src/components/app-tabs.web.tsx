import { Tabs, TabSlot, TabList, TabTrigger } from 'expo-router/ui';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList style={{ display: 'none' }}>
        <TabTrigger name="home" href="/(tabs)" />
        <TabTrigger name="profile" href="/(tabs)/profile" />
      </TabList>
    </Tabs>
  );
}
