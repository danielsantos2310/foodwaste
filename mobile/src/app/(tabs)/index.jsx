import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MapPin, Clock } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";

export default function BrowseMeals() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);

  const fetchMeals = async () => {
    try {
      let url = "/api/meals";

      if (location) {
        url += `?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch meals");

      const data = await response.json();
      setMeals(data.meals || []);
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      }
    })();
  }, []);

  useEffect(() => {
    fetchMeals();
  }, [location]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMeals();
  };

  const getTimeRemaining = (availableUntil) => {
    const now = new Date();
    const deadline = new Date(availableUntil);
    const diff = deadline - now;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 60) return `${minutes}m left`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m left`;
  };

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
          Rescue Food
        </Text>
        <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
          Save meals, save money, save the planet
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
            Loading meals...
          </Text>
        ) : meals.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>
              No meals available
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Check back soon for new rescue meals!
            </Text>
          </View>
        ) : (
          meals.map((meal) => (
            <TouchableOpacity
              key={meal.id}
              onPress={() => router.push(`/meal/${meal.id}`)}
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
              {meal.image_url ? (
                <Image
                  source={{ uri: meal.image_url }}
                  style={{ width: "100%", height: 200 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: 200,
                    backgroundColor: "#E5E7EB",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#9CA3AF" }}>No image</Text>
                </View>
              )}

              <View style={{ padding: 16 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#111827",
                    marginBottom: 4,
                  }}
                >
                  {meal.name}
                </Text>
                <Text
                  style={{ fontSize: 14, color: "#6B7280", marginBottom: 12 }}
                >
                  {meal.restaurant_name}
                </Text>

                {meal.description && (
                  <Text
                    style={{ fontSize: 14, color: "#4B5563", marginBottom: 12 }}
                    numberOfLines={2}
                  >
                    {meal.description}
                  </Text>
                )}

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
                    {meal.address}
                  </Text>
                </View>

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
                    {getTimeRemaining(meal.available_until)}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "#10B981",
                      }}
                    >
                      €{parseFloat(meal.sale_price).toFixed(2)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        color: "#9CA3AF",
                        marginLeft: 8,
                        textDecorationLine: "line-through",
                      }}
                    >
                      €{parseFloat(meal.original_price).toFixed(2)}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: "#10B981",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{ color: "#fff", fontWeight: "600", fontSize: 12 }}
                    >
                      Save{" "}
                      {Math.round(
                        (1 - meal.sale_price / meal.original_price) * 100,
                      )}
                      %
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
