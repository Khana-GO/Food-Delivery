import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useClerk, useSignUp } from "@clerk/expo";

export default function SignUpScreen() {
  const { signUp } = useSignUp();
  const { setActive } = useClerk();

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);

  const handleSignUp = async () => {
    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      setPendingVerification(true);
    } catch (err: any) {
      Alert.alert(
        "Sign Up Failed",
        err.errors?.[0]?.message || "Something went wrong",
      );
    }
  };

  const verifyCode = async () => {

    try {
      const result = await (signUp as any).attemptEmailAddressVerification({
        code,
      });

      if (
        result.status !== "complete" ||
        !result.createdSessionId ||
        !setActive
      ) {
        Alert.alert(
          "Verification Incomplete",
          "Please complete the remaining verification steps.",
        );
        return;
      }

      await setActive({ session: result.createdSessionId });

      router.replace("/");
    } catch (err: any) {
      Alert.alert(
        "Verification Failed",
        err.errors?.[0]?.message || "Invalid code",
      );
    }
  };

  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify Email</Text>

        <TextInput
          placeholder="Enter verification code"
          style={styles.input}
          value={code}
          onChangeText={setCode}
        />

        <TouchableOpacity style={styles.button} onPress={verifyCode}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/sign-in" as any)}>
        <Text style={styles.link}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#FF6B35",
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#FF6B35",
  },
});
