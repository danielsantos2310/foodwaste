import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MapPin, Clock, CheckCircle, XCircle } from "lucide-react-native";
import { useAuth } from "@/utils/auth/useAuth";

export default function MyOrders() {
  const insets = useSafeAreaInsets();
  const { signIn, isReady, auth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders/my-orders");
      if (!response.ok) throw new Error("Failed to fetch orders");

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isReady && auth) {
      fetchOrders();
    } else if (isReady) {
      setLoading(false);
    }
  }, [isReady, auth]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 0) return "Expired";
    if (minutes < 60) return `${minutes}m left`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m left`;
  };

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
            My Orders
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
            Sign in to view orders
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            Create an account to start rescuing meals
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

  if (selectedOrder) {
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
          <TouchableOpacity onPress={() => setSelectedOrder(null)}>
            <Text style={{ fontSize: 16, color: "#10B981", marginBottom: 8 }}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111827" }}>
            Pickup Code
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, alignItems: "center" }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 24,
              borderRadius: 16,
              alignItems: "center",
              width: "100%",
              marginBottom: 20,
            }}
          >
            <View
              style={{
                backgroundColor: "#F3F4F6",
                padding: 20,
                borderRadius: 12,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "#111827",
                  letterSpacing: 2,
                  textAlign: "center",
                }}
              >
                {selectedOrder.qr_code}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#111827",
                marginTop: 12,
              }}
            >
              {selectedOrder.meal_name}
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
              {selectedOrder.restaurant_name}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#6B7280",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              {selectedOrder.address}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "#FEF3C7",
              padding: 16,
              borderRadius: 12,
              width: "100%",
              marginBottom: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Clock size={18} color="#D97706" />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#D97706",
                  marginLeft: 8,
                }}
              >
                Pickup by:{" "}
                {new Date(selectedOrder.pickup_deadline).toLocaleTimeString(
                  [],
                  { hour: "2-digit", minute: "2-digit" },
                )}
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: "#92400E" }}>
              {getTimeRemaining(selectedOrder.pickup_deadline)}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 12,
              width: "100%",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 8,
              }}
            >
              Instructions
            </Text>
            <Text style={{ fontSize: 13, color: "#6B7280", lineHeight: 20 }}>
              1. Arrive at the restaurant before the pickup deadline{"\n"}
              2. Show this code to the staff{"\n"}
              3. Collect your meal and enjoy!
            </Text>
          </View>
        </ScrollView>
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
          My Orders
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
          />
        }
      >
        {loading ? (
          <Text
            style={{ textAlign: "center", color: "#6B7280", marginTop: 40 }}
          >
            Loading orders...
          </Text>
        ) : orders.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>
              No orders yet
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 8 }}>
              Start rescuing meals!
            </Text>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              onPress={() =>
                order.status === "pending" && setSelectedOrder(order)
              }
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                marginBottom: 16,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View style={{ padding: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: "#111827",
                        marginBottom: 4,
                      }}
                    >
                      {order.meal_name}
                    </Text>
                    <Text style={{ fontSize: 14, color: "#6B7280" }}>
                      {order.restaurant_name}
                    </Text>
                  </View>
                  {order.status === "completed" ? (
                    <CheckCircle size={24} color="#10B981" />
                  ) : order.status === "cancelled" ? (
                    <XCircle size={24} color="#EF4444" />
                  ) : (
                    <View
                      style={{
                        backgroundColor: "#FEF3C7",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "600",
                          color: "#D97706",
                        }}
                      >
                        Pending
                      </Text>
                    </View>
                  )}
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <MapPin size={16} color="#6B7280" />
                  <Text
                    style={{ fontSize: 13, color: "#6B7280", marginLeft: 6 }}
                  >
                    {order.address}
                  </Text>
                </View>

                {order.status === "pending" && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Clock size={16} color="#EF4444" />
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#EF4444",
                        marginLeft: 6,
                        fontWeight: "600",
                      }}
                    >
                      {getTimeRemaining(order.pickup_deadline)}
                    </Text>
                  </View>
                )}

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#10B981",
                    }}
                  >
                    €{parseFloat(order.amount_paid).toFixed(2)}
                  </Text>
                  {order.status === "pending" && (
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#10B981",
                        fontWeight: "600",
                      }}
                    >
                      Tap to view code →
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
