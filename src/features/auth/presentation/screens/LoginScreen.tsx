"use client"

import { useMemo, useState } from "react"
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native"
import { Button, Divider, Surface, Text, TextInput } from "react-native-paper"
import { useAuth } from "../context/authContext"

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i

function SocialButton({
  label,
  icon,
  onPress,
}: {
  label: string
  icon: string
  onPress?: () => void
}) {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      icon={icon}
      style={styles.socialBtn}
      contentStyle={{ height: 48 }}
      buttonColor="#2E2E2E"
      textColor="#FFFFFF"
    >
      {label}
    </Button>
  )
}

export default function LoginScreen({ navigation }: { navigation: any }) {
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [securePassword, setSecurePassword] = useState(true)
  const [loading, setLoading] = useState(false)

  const emailError = useMemo(() => {
    if (!email) return ""
    return emailRegex.test(email) ? "" : "Email inválido"
  }, [email])

  const passwordError = useMemo(() => {
    if (!password) return ""
    return password.length >= 8 ? "" : "Mínimo 8 caracteres"
  }, [password])

  const isFormValid = emailRegex.test(email) && password.length >= 8

  const handleLogin = async () => {
    if (!isFormValid) return
    try {
      setLoading(true)
      await login(email.trim(), password)
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Surface style={styles.root}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            {/* Header */}
            <Text variant="headlineSmall" style={styles.title}>
              Welcome back
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Log in to continue enjoying your smart home.
            </Text>

            {/* Email Input */}
            <TextInput
              mode="flat"
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              error={!!emailError}
              underlineColor="transparent"
              style={[styles.input, styles.inputPill]}
              left={<TextInput.Icon icon="email-outline" />}
              theme={{
                colors: {
                  onSurface: "#1F1F1F",
                  placeholder: "#8A8F98",
                },
              }}
            />
            {emailError ? <Text style={styles.helperText}>{emailError}</Text> : null}

            {/* Password Input */}
            <TextInput
              mode="flat"
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={securePassword}
              error={!!passwordError}
              underlineColor="transparent"
              style={[styles.input, styles.inputPill]}
              left={<TextInput.Icon icon="lock-outline" />}
              right={
                <TextInput.Icon
                  icon={securePassword ? "eye-off-outline" : "eye-outline"}
                  onPress={() => setSecurePassword((prev) => !prev)}
                />
              }
              theme={{
                colors: {
                  onSurface: "#1F1F1F",
                  placeholder: "#8A8F98",
                },
              }}
            />
            {passwordError ? <Text style={styles.helperText}>{passwordError}</Text> : null}

            {/* Primary Button */}
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={!isFormValid || loading}
              style={styles.primaryBtn}
              contentStyle={{ height: 52 }}
              buttonColor="#111111"
              textColor="#FFFFFF"
            >
              Log In
            </Button>

            <Divider style={styles.divider} />

            {/* Signup Button */}
            <Button
              mode="contained"
              onPress={() => navigation.navigate("Signup")}
              style={styles.signupBtn}
              contentStyle={{ height: 48 }}
              buttonColor="#2E2E2E"
              textColor="#FFFFFF"
            >
              Don't have an account? Sign Up
            </Button>
          </View>
        </ScrollView>
      </Surface>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F6F7F9",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingVertical: 28,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "700",
    color: "#111111", // already black, no change needed
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 20,
    color: "#8A8F98",
    fontWeight: "500",
  },
  input: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: "#F9F9F9",
  },
  inputPill: {
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  socialBtn: {
    borderRadius: 12,
    marginVertical: 8,
    justifyContent: "center",
  },
  helperText: {
    color: "#d32f2f",
    marginTop: 6,
    marginLeft: 12,
    fontSize: 12,
  },
  primaryBtn: {
    marginTop: 18,
    borderRadius: 16,
  },
  divider: {
    marginVertical: 18,
    backgroundColor: "#E6E8EC",
  },
  signupBtn: {
    borderRadius: 16,
    marginBottom: 12,
  },
})
