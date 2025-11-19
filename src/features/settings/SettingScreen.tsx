import FloatingBottomBar from '@/src/components/FloatingBottomBar';
import { useAuth } from '@/src/features/auth/presentation/context/authContext';
import { StyleSheet, View } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';

export default function SettingScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  return (
    <Surface style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutBtn}
          buttonColor="#111111"
          textColor="#FFFFFF"
          contentStyle={{ height: 48 }}
        >
          Logout
        </Button>
      </View>

      <FloatingBottomBar />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#111111",
  },
  logoutBtn: {
    marginTop: 10,
    width: "70%",
    borderRadius: 16,
  },
});
