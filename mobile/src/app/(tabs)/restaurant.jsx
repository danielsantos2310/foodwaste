import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Plus, Clock, CheckCircle } from "lucide-react-native";
import { useAuth } from "@/utils/auth/useAuth";
import { useRouter } from "expo-router";

export default function RestaurantDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn, isReady, auth } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [meals, setMeals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: "",
    description: "",
    original_price: "",
    sale_price: "",
    hours_until_pickup: "1",
  });

  const fetchRestaurantData = async () => {
    try {
      const [restaurantRes, mealsRes, ordersRes] = await Promise.all([
        fetch("/api/restaurants"),
        fetch("/api/meals/my-meals"),
        fetch("/api/orders/restaurant-orders"),
      ]);

      if (restaurantRes.ok) {
        const restaurantData = await restaurantRes.json();
        setRestaurant(restaurantData.restaurant);
      }

      if (mealsRes.ok) {
        const mealsData = await mealsRes.json();
        setMeals(mealsData.meals || []);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
    } catch (error) {
      console.error("Error fetching restaurant data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isReady && auth) {
      fetchRestaurantData();
    } else if (isReady) {
      setLoading(false);
    }
  }, [isReady, auth]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRestaurantData();
  };

  const handleAddMeal = async () => {
    try {
      const availableUntil = new Date();
      availableUntil.setHours(
        availableUntil.getHours() + parseInt(newMeal.hours_until_pickup || 1),
      );

      const response = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newMeal.name,
          description: newMeal.description,
          original_price: parseFloat(newMeal.original_price),
          sale_price: parseFloat(newMeal.sale_price),
          available_until: availableUntil.toISOString(),
        }),
      });

      if (response.ok) {
        setShowAddMeal(false);
        setNewMeal({
          name: "",
          description: "",
          original_price: "",
          sale_price: "",
          hours_until_pickup: "1",
        });
        fetchRestaurantData();
      }
    } catch (error) {
      console.error("Error adding meal:", error);
    }
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
            Restaurant
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
            Sign in to manage
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            List your meals and reduce food waste
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

  if (!restaurant) {
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
            Restaurant
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
            Set up your restaurant
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            Create your restaurant profile to start listing meals
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/setup-restaurant")}
            style={{
              backgroundColor: "#10B981",
              paddingHorizontal: 32,
              paddingVertical: 14,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
              Create Restaurant
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (showAddMeal) {
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
          <TouchableOpacity onPress={() => setShowAddMeal(false)}>
            <Text style={{ fontSize: 16, color: "#10B981", marginBottom: 8 }}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111827" }}>
            Add Meal
          </Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#374151",
                marginBottom: 8,
              }}
            >
              Meal Name
            </Text>
            <TextInput
              value={newMeal.name}
              onChangeText={(text) => setNewMeal({ ...newMeal, name: text })}
              placeholder="e.g. Margherita Pizza"
              style={{
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
              }}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#374151",
                marginBottom: 8,
              }}
            >
              Description
            </Text>
            <TextInput
              value={newMeal.description}
              onChangeText={(text) =>
                setNewMeal({ ...newMeal, description: text })
              }
              placeholder="Brief description"
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                minHeight: 80,
              }}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#374151",
                marginBottom: 8,
              }}
            >
              Original Price (€)
            </Text>
            <TextInput
              value={newMeal.original_price}
              onChangeText={(text) =>
                setNewMeal({ ...newMeal, original_price: text })
              }
              placeholder="20.00"
              keyboardType="decimal-pad"
              style={{
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
              }}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#374151",
                marginBottom: 8,
              }}
            >
              Sale Price (€)
            </Text>
            <TextInput
              value={newMeal.sale_price}
              onChangeText={(text) =>
                setNewMeal({ ...newMeal, sale_price: text })
              }
              placeholder="5.00"
              keyboardType="decimal-pad"
              style={{
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
              }}
            />
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#374151",
                marginBottom: 8,
              }}
            >
              Hours Until Pickup
            </Text>
            <TextInput
              value={newMeal.hours_until_pickup}
              onChangeText={(text) =>
                setNewMeal({ ...newMeal, hours_until_pickup: text })
              }
              placeholder="1"
              keyboardType="number-pad"
              style={{
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
              }}
            />
          </View>

          <TouchableOpacity
            onPress={handleAddMeal}
            disabled={
              !newMeal.name || !newMeal.original_price || !newMeal.sale_price
            }
            style={{
              backgroundColor:
                newMeal.name && newMeal.original_price && newMeal.sale_price
                  ? "#10B981"
                  : "#D1D5DB",
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
              List Meal
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  const totalEarnings = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + parseFloat(o.restaurant_earnings || 0), 0);

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
          {restaurant.name}
        </Text>
        <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
          {restaurant.address}
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
        <View
          style={{
            backgroundColor: "#10B981",
            padding: 20,
            borderRadius: 16,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 14, color: "#D1FAE5", marginBottom: 4 }}>
            Total Earnings
          </Text>
          <Text style={{ fontSize: 32, fontWeight: "bold", color: "#fff" }}>
            €{totalEarnings.toFixed(2)}
          </Text>
          <Text style={{ fontSize: 13, color: "#D1FAE5", marginTop: 8 }}>
            {orders.filter((o) => o.status === "completed").length} completed
            orders
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111827" }}>
            Active Meals
          </Text>
          <TouchableOpacity
            onPress={() => setShowAddMeal(true)}
            style={{
              backgroundColor: "#10B981",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Plus size={18} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 6 }}>
              Add
            </Text>
          </TouchableOpacity>
        </View>

        {meals.filter((m) => m.status === "available").length === 0 ? (
          <View
            style={{
              backgroundColor: "#fff",
              padding: 24,
              borderRadius: 12,
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 4,
              }}
            >
              No active meals
            </Text>
            <Text
              style={{ fontSize: 14, color: "#6B7280", textAlign: "center" }}
            >
              Add meals to start reducing waste
            </Text>
          </View>
        ) : (
          meals
            .filter((m) => m.status === "available")
            .map((meal) => (
              <View
                key={meal.id}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#111827",
                    marginBottom: 4,
                  }}
                >
                  {meal.name}
                </Text>
                {meal.description && (
                  <Text
                    style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}
                  >
                    {meal.description}
                  </Text>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#10B981",
                      }}
                    >
                      €{parseFloat(meal.sale_price).toFixed(2)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#9CA3AF",
                        marginLeft: 6,
                        textDecorationLine: "line-through",
                      }}
                    >
                      €{parseFloat(meal.original_price).toFixed(2)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Clock size={14} color="#6B7280" />
                    <Text
                      style={{ fontSize: 12, color: "#6B7280", marginLeft: 4 }}
                    >
                      {new Date(meal.available_until).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            ))
        )}

        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#111827",
            marginTop: 8,
            marginBottom: 16,
          }}
        >
          Recent Orders
        </Text>

        {orders.slice(0, 5).map((order) => (
          <View
            key={order.id}
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}
                >
                  {order.meal_name}
                </Text>
                <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
                  {new Date(order.created_at).toLocaleDateString()}
                </Text>
              </View>
              {order.status === "completed" && (
                <CheckCircle size={20} color="#10B981" />
              )}
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, color: "#6B7280" }}>
                Your earnings:
              </Text>
              <Text
                style={{ fontSize: 16, fontWeight: "bold", color: "#10B981" }}
              >
                €{parseFloat(order.restaurant_earnings).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
