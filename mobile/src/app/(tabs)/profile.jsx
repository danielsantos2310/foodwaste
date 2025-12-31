import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/utils/auth/useAuth";
import { LogOut, Mail, User as UserIcon } from "lucide-react-native";

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { signIn, signOut, isReady, auth } = useAuth();

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F9FAFB",
          paddingTop: insets.top,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#6B7280" }}>Loading...</Text>
      </View>
    );
  }

  if (!auth) {
    return (
      <View
        style={{ flex: 1, backgroundColor: "#F9FAFB", paddingTop: insets.top }}
      >
        <StatusBar style="dark" />
        <View
          style={{
            padding: 20,
            backgroundColor: "#fff",
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#111827" }}>
            Profile
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Sign in to continue
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            Create an account to rescue meals and reduce waste
          </Text>
          <TouchableOpacity
            onPress={() => signIn()}
            style={{
              backgroundColor: "#10B981",
              paddingHorizontal: 32,
              paddingVertical: 14,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: "#F9FAFB", paddingTop: insets.top }}
    >
      <StatusBar style="dark" />

      <View
        style={{
          padding: 20,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#111827" }}>
          Profile
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#10B981",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <UserIcon size={40} color="#fff" />
            </View>
            <Text
              style={{ fontSize: 20, fontWeight: "bold", color: "#111827" }}
            >
              {auth.user?.name || auth.user?.email || "User"}
            </Text>
          </View>

          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: "#E5E7EB",
              paddingTop: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Mail size={20} color="#6B7280" />
              <Text style={{ fontSize: 16, color: "#374151", marginLeft: 12 }}>
                {auth.user?.email}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 12,
            }}
          >
            About Rescue Food
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              lineHeight: 20,
              marginBottom: 12,
            }}
          >
            We're on a mission to reduce food waste while helping people save
            money on quality meals.
          </Text>
          <Text style={{ fontSize: 14, color: "#6B7280", lineHeight: 20 }}>
            Every meal you rescue helps restaurants reduce waste and supports a
            more sustainable future.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => signOut()}
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "#EF4444",
          }}
        >
          <LogOut size={20} color="#EF4444" />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#EF4444",
              marginLeft: 8,
            }}
          >
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
