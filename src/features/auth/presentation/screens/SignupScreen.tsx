"use client"

import React, { useMemo, useState } from "react"
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native"
import { Button, Surface, Text, TextInput } from "react-native-paper"
import { useAuth } from "../context/authContext"

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
const passRegex  = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\s]).{8,}$/ // 8+, minúscula, mayúscula, especial

function Rule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <Text style={[styles.rule, { color: ok ? "#1e7e34" : "#8A8F98" }]}>
      {ok ? "✓" : "•"} {text}
    </Text>
  )
}

export default function SignupScreen({ navigation }: { navigation: any }) {
  const { signup } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [secure, setSecure] = useState(true)
  const [secure2, setSecure2] = useState(true)
  const [loading, setLoading] = useState(false)

  // focus states para color del label
  const [focusEmail, setFocusEmail] = useState(false)
  const [focusPass, setFocusPass]   = useState(false)
  const [focusConf, setFocusConf]   = useState(false)

  const emailError = useMemo(() => (email && !emailRegex.test(email) ? "Email inválido" : ""), [email])
  const passwordError = useMemo(() => (password && !passRegex.test(password) ? "La contraseña no cumple los requisitos" : ""), [password])
  const confirmError = useMemo(() => (confirm && confirm !== password ? "Las contraseñas no coinciden" : ""), [confirm, password])

  const rules = {
    len: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    special: /[^\w\s]/.test(password),
  }

  const formValid = emailRegex.test(email) && passRegex.test(password) && confirm === password

  const handleSignup = async () => {
    if (!formValid) return
    try {
      setLoading(true)
      await signup(email.trim(), password)
    } finally {
      setLoading(false)
    }
  }
  

  // Colores del label (oscuro con foco, gris sin foco)
  const focusedColor = "#111111"
  const blurColor    = "#8A8F98"

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Surface style={styles.root}>
        <View style={styles.card}>
          <Text variant="headlineSmall" style={styles.title}>Create an account</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>Sign up to enjoy seamless access and personalized experiences.</Text>

          {/* Email */}
          <TextInput
            mode="flat"
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            error={!!emailError}
            underlineColor="transparent"
            style={[styles.input, styles.pillWhite]}
            left={<TextInput.Icon icon="email-outline" />}
            onFocus={() => setFocusEmail(true)}
            onBlur={() => setFocusEmail(false)}
            theme={{ colors: { primary: focusEmail ? focusedColor : blurColor, onSurface: "#1F1F1F", placeholder: blurColor } }}
          />
          {!!emailError && <Text style={styles.helper}>{emailError}</Text>}

          {/* Password */}
          <TextInput
            mode="flat"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secure}
            error={!!passwordError}
            underlineColor="transparent"
            style={[styles.input, styles.pillWhite]}
            left={<TextInput.Icon icon="lock-outline" />}
            right={<TextInput.Icon icon={secure ? "eye-off-outline" : "eye-outline"} onPress={() => setSecure(s => !s)} />}
            onFocus={() => setFocusPass(true)}
            onBlur={() => setFocusPass(false)}
            theme={{ colors: { primary: focusPass ? focusedColor : blurColor, onSurface: "#1F1F1F", placeholder: blurColor } }}
          />
          {/* Mostrar reglas SOLO si escribió y no cumple */}
          
          {!!passwordError && <Text style={styles.helper}>{passwordError}</Text>}

          {/* Confirm Password */}
          <TextInput
            mode="flat"
            label="Confirm password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={secure2}
            error={!!confirmError}
            underlineColor="transparent"
            style={[styles.input, styles.pillWhite]}
            left={<TextInput.Icon icon="lock-check-outline" />}
            right={<TextInput.Icon icon={secure2 ? "eye-off-outline" : "eye-outline"} onPress={() => setSecure2(s => !s)} />}
            onFocus={() => setFocusConf(true)}
            onBlur={() => setFocusConf(false)}
            theme={{ colors: { primary: focusConf ? focusedColor : blurColor, onSurface: "#1F1F1F", placeholder: blurColor } }}
          />
          {!!confirmError && <Text style={styles.helper}>{confirmError}</Text>}

          {password.length > 0 && !passRegex.test(password) && (
            <View style={{ marginTop: 6, marginBottom: 6 }}>
              <Rule ok={rules.len}     text="Mínimo 8 caracteres" />
              <Rule ok={rules.lower}   text="Al menos 1 minúscula" />
              <Rule ok={rules.upper}   text="Al menos 1 mayúscula" />
              <Rule ok={rules.special} text="Al menos 1 carácter especial" />
            </View>
          )}

          <Button
            mode="contained"
            onPress={() => { handleSignup(); navigation.goBack(); }}
            loading={loading}
            disabled={!formValid || loading}
            style={styles.primaryBtn}
            contentStyle={{ height: 52 }}
            buttonColor="#111111"
            textColor="#FFFFFF"
          >
            Create an Account
          </Button>

          <Button
            mode="contained"
            onPress={() => navigation.navigate("Login")}
            style={styles.signupRedirectBtn}
            contentStyle={{ height: 48 }}
            buttonColor="#2E2E2E"
            textColor="#FFFFFF"
          >
            Already have an account? Log In
          </Button>
        </View>
      </Surface>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#F6F7F9" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 22,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  title: { textAlign: "center", marginBottom: 6, fontWeight: "700", color: "#111111" },
  subtitle: { textAlign: "center", marginBottom: 18, color: "#8A8F98" },
  input: { marginTop: 12, borderRadius: 18 },
  pillWhite: {
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  helper: { color: "#d32f2f", marginTop: 6, marginLeft: 6 },
  rule: { fontSize: 12, marginLeft: 6, marginTop: 2 },
  primaryBtn: { marginTop: 12, borderRadius: 16 },
  signupRedirectBtn: { borderRadius: 16, marginTop: 14 },
})
