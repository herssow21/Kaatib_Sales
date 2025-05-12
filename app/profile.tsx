import React, { useState } from "react";
import {
  View,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
  Image,
  Pressable,
  TextInput as RNTextInput,
} from "react-native";
import {
  Text,
  Card,
  Divider,
  useTheme,
  ProgressBar,
  Surface,
  Portal,
  Modal,
  Button,
  IconButton,
  SegmentedButtons,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

const initialUser = {
  name: "John Doe",
  role: "Sales Associate",
  email: "john.doe@kaatib.com",
  employeeId: "emp-001",
  branch: "Main Store",
  joined: "Jan 2023",
  salesRank: 2,
  totalSalesPeople: 12,
  salesPeriod: "May 2025",
  commissionRate: "5%",
  isTopPerformer: false,
  avatar: undefined,
};

const paymentDataByRange = {
  today: [
    {
      label: "Cash",
      value: 200,
      percent: 0.1,
      color: "#E53935",
      icon: "attach-money",
    },
    {
      label: "Credit",
      value: 1500,
      percent: 0.7,
      color: "#B71C1C",
      icon: "credit-card",
    },
    {
      label: "Debit",
      value: 440,
      percent: 0.2,
      color: "#D32F2F",
      icon: "payment",
    },
  ],
  week: [
    {
      label: "Cash",
      value: 1200,
      percent: 0.2,
      color: "#E53935",
      icon: "attach-money",
    },
    {
      label: "Credit",
      value: 4200,
      percent: 0.6,
      color: "#B71C1C",
      icon: "credit-card",
    },
    {
      label: "Debit",
      value: 800,
      percent: 0.2,
      color: "#D32F2F",
      icon: "payment",
    },
  ],
  month: [
    {
      label: "Cash",
      value: 2508.6,
      percent: 0.2,
      color: "#E53935",
      icon: "attach-money",
    },
    {
      label: "Credit",
      value: 7526.4,
      percent: 0.6,
      color: "#B71C1C",
      icon: "credit-card",
    },
    {
      label: "Debit",
      value: 626.55,
      percent: 0.05,
      color: "#D32F2F",
      icon: "payment",
    },
  ],
  year: [
    {
      label: "Cash",
      value: 12000,
      percent: 0.3,
      color: "#E53935",
      icon: "attach-money",
    },
    {
      label: "Credit",
      value: 25000,
      percent: 0.5,
      color: "#B71C1C",
      icon: "credit-card",
    },
    {
      label: "Debit",
      value: 8000,
      percent: 0.2,
      color: "#D32F2F",
      icon: "payment",
    },
  ],
};

const summaryDataByRange = {
  today: {
    totalSales: "$2,140.00",
    transactions: 12,
    avgSale: "$178.33",
    salesChange: "+2%",
    txChange: "+1%",
    avgChange: "+1%",
  },
  week: {
    totalSales: "$6,200.00",
    transactions: 54,
    avgSale: "$114.81",
    salesChange: "+5%",
    txChange: "+3%",
    avgChange: "+2%",
  },
  month: {
    totalSales: "$12,543.00",
    transactions: 432,
    avgSale: "$29.03",
    salesChange: "+18%",
    txChange: "+5%",
    avgChange: "+12%",
  },
  year: {
    totalSales: "$120,000.00",
    transactions: 3200,
    avgSale: "$37.50",
    salesChange: "+22%",
    txChange: "+8%",
    avgChange: "+10%",
  },
};

export function Profile() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isLarge = width > 900;
  const [user, setUser] = useState(initialUser);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(user.avatar);
  const [editAvatarVisible, setEditAvatarVisible] = useState(false);
  const [editNameVisible, setEditNameVisible] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [range, setRange] = useState<"today" | "week" | "month" | "year">(
    "month"
  );

  const paymentMethods = paymentDataByRange[range];
  const summary = summaryDataByRange[range];

  const greenShades = ["#2ecc40", "#51d88a", "#a0eec0"]; // Most to least saturated
  // Sort payment methods by value descending
  const sortedPaymentMethods = [...paymentMethods].sort(
    (a, b) => b.value - a.value
  );

  // Commission calculation (mocked for now)
  const commissionRate = parseFloat(user.commissionRate) / 100 || 0;
  const commissionEarned =
    commissionRate > 0
      ? (
          parseFloat(summary.totalSales.replace(/[$,]/g, "")) * commissionRate
        ).toFixed(2)
      : "0.00";

  function handleEditAvatar() {
    setEditAvatarVisible(true);
  }
  function handleAvatarPicked(uri: string) {
    setAvatarUri(uri);
    setEditAvatarVisible(false);
    setUser((u) => ({ ...u, avatar: uri }));
  }
  function handleEditName() {
    setNameInput(user.name);
    setEditNameVisible(true);
  }
  function handleSaveName() {
    setUser((u) => ({ ...u, name: nameInput }));
    setEditNameVisible(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: isLarge ? 32 : 12 }}
      >
        <SegmentedButtons
          value={range}
          onValueChange={(v) => setRange(v as any)}
          buttons={[
            { value: "today", label: "Today" },
            { value: "week", label: "This Week" },
            { value: "month", label: "Month" },
            { value: "year", label: "Year" },
          ]}
          style={styles.segmented}
        />
        <View
          style={[styles.row, { flexDirection: isLarge ? "row" : "column" }]}
        >
          {/* Profile Card */}
          <Surface
            style={[
              styles.profileCard,
              { marginRight: isLarge ? 32 : 0, marginBottom: isLarge ? 0 : 24 },
            ]}
            elevation={4}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={
                    avatarUri
                      ? { uri: avatarUri }
                      : require("../assets/images/avatar-placeholder.png")
                  }
                  style={styles.avatar}
                  accessible
                  accessibilityLabel="Profile picture"
                />
                <Pressable
                  style={styles.editAvatarButton}
                  accessibilityRole="button"
                  accessibilityLabel="Edit profile picture"
                  onPress={handleEditAvatar}
                >
                  <Surface style={styles.editAvatarIconSurface} elevation={2}>
                    <MaterialIcons name="edit" size={20} color="#fff" />
                  </Surface>
                </Pressable>
              </View>
              <View style={styles.nameRow}>
                <Text style={styles.name} accessibilityRole="header">
                  {user.name}
                </Text>
                <IconButton
                  icon="pencil"
                  size={20}
                  style={styles.editNameIcon}
                  onPress={handleEditName}
                  accessibilityLabel="Edit name"
                />
              </View>
              <Text style={styles.role}>{user.role}</Text>
              {user.isTopPerformer && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Top Performer</Text>
                </View>
              )}
            </View>
            <View style={styles.profileDetailsRow}>
              <View style={styles.profileDetail}>
                <Text style={styles.detailLabel}>Employee ID</Text>
                <Text style={styles.detailValue}>{user.employeeId}</Text>
              </View>
              <View style={styles.profileDetail}>
                <Text style={styles.detailLabel}>Branch</Text>
                <Text style={styles.detailValue}>{user.branch}</Text>
              </View>
            </View>
            <View style={styles.profileDetailsRow}>
              <View style={styles.profileDetail}>
                <Text style={styles.detailLabel}>Joined</Text>
                <Text style={styles.detailValue}>{user.joined}</Text>
              </View>
              <View style={styles.profileDetail}>
                <Text style={styles.detailLabel}>Sales Rank</Text>
                <Text style={styles.detailValue}>
                  #{user.salesRank} of {user.totalSalesPeople}
                </Text>
              </View>
            </View>
            <Divider style={{ marginVertical: 16 }} />
            <View style={styles.profileDetailsColumn}>
              <View style={styles.profileDetail}>
                <MaterialIcons name="email" size={18} color="#E53935" />
                <Text style={styles.detailValue}> {user.email}</Text>
              </View>
              <View style={styles.profileDetail}>
                <MaterialIcons
                  name="calendar-today"
                  size={18}
                  color="#E53935"
                />
                <Text style={styles.detailValue}>
                  {" "}
                  Sales Period: {user.salesPeriod}
                </Text>
              </View>
              <View style={styles.profileDetail}>
                <MaterialIcons name="percent" size={18} color="#E53935" />
                <Text style={styles.detailValue}>
                  {" "}
                  Commission Rate: {user.commissionRate}
                </Text>
              </View>
            </View>
          </Surface>

          {/* Sales Summary and Payment Breakdown */}
          <View style={{ flex: 1, gap: 24 }}>
            <View
              style={[
                styles.row,
                { flexDirection: isLarge ? "row" : "column", gap: 24 },
              ]}
            >
              <Card style={styles.summaryCard} elevation={3}>
                <Card.Content>
                  <Text style={styles.summaryLabel}>Total Sales</Text>
                  <Text style={styles.summaryValue}>{summary.totalSales}</Text>
                  <Text style={styles.summaryChange}>
                    {summary.salesChange} from last {range}
                  </Text>
                </Card.Content>
              </Card>
              <Card style={styles.summaryCard} elevation={3}>
                <Card.Content>
                  <Text style={styles.summaryLabel}>Transactions</Text>
                  <Text style={styles.summaryValue}>
                    {summary.transactions}
                  </Text>
                  <Text style={styles.summaryChange}>
                    {summary.txChange} from last {range}
                  </Text>
                </Card.Content>
              </Card>
              <Card style={styles.summaryCard} elevation={3}>
                <Card.Content>
                  <Text style={styles.summaryLabel}>Commission Earned</Text>
                  <Text style={styles.summaryValue}>${commissionEarned}</Text>
                  <Text style={styles.summaryChange}>
                    {commissionRate > 0
                      ? `${user.commissionRate} of sales`
                      : "0% commission for employee"}
                  </Text>
                </Card.Content>
              </Card>
            </View>
            <Card style={styles.paymentCard} elevation={3}>
              <Card.Content>
                <Text style={styles.paymentTitle}>Sales by Payment Method</Text>
                <Text style={styles.paymentSubtitle}>
                  Breakdown of your sales by payment type
                </Text>
                <View style={styles.paymentTable}>
                  {sortedPaymentMethods.map((method, idx) => (
                    <View
                      key={method.label}
                      style={styles.paymentRowHorizontal}
                    >
                      <MaterialIcons
                        name={method.icon as any}
                        size={22}
                        color={
                          greenShades[idx] ||
                          greenShades[greenShades.length - 1]
                        }
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={[
                          styles.paymentLabel,
                          {
                            color:
                              greenShades[idx] ||
                              greenShades[greenShades.length - 1],
                          },
                        ]}
                      >
                        {method.label}
                      </Text>
                      <Text style={styles.paymentValue}>
                        $
                        {method.value.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                      <View style={styles.paymentBarBgHorizontal}>
                        <View
                          style={[
                            styles.paymentBarFillHorizontal,
                            {
                              width: `${method.percent * 100}%`,
                              backgroundColor:
                                greenShades[idx] ||
                                greenShades[greenShades.length - 1],
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.paymentPercent,
                          {
                            color:
                              greenShades[idx] ||
                              greenShades[greenShades.length - 1],
                          },
                        ]}
                      >
                        {Math.round(method.percent * 100)}%
                      </Text>
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>
          </View>
        </View>
        {/* Avatar Edit Modal (placeholder) */}
        <Portal>
          <Modal
            visible={editAvatarVisible}
            onDismiss={() => setEditAvatarVisible(false)}
            contentContainerStyle={styles.modalContent}
          >
            <Text
              style={{ fontWeight: "bold", fontSize: 18, marginBottom: 16 }}
            >
              Change Profile Photo
            </Text>
            <Button
              mode="contained"
              onPress={() => {
                handleAvatarPicked(
                  "https://randomuser.me/api/portraits/men/1.jpg"
                );
              }}
            >
              Pick from Gallery (Demo)
            </Button>
            <Button
              mode="text"
              onPress={() => setEditAvatarVisible(false)}
              style={{ marginTop: 8 }}
            >
              Cancel
            </Button>
          </Modal>
          <Modal
            visible={editNameVisible}
            onDismiss={() => setEditNameVisible(false)}
            contentContainerStyle={styles.modalContent}
          >
            <Text
              style={{ fontWeight: "bold", fontSize: 18, marginBottom: 16 }}
            >
              Edit Name
            </Text>
            <RNTextInput
              value={nameInput}
              onChangeText={setNameInput}
              style={styles.nameInput}
              placeholder="Enter your name"
              autoFocus
            />
            <Button
              mode="contained"
              onPress={handleSaveName}
              style={{ marginTop: 16 }}
            >
              Save
            </Button>
            <Button
              mode="text"
              onPress={() => setEditNameVisible(false)}
              style={{ marginTop: 8 }}
            >
              Cancel
            </Button>
          </Modal>
        </Portal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  segmented: {
    marginBottom: 24,
    alignSelf: "center",
    width: 400,
    maxWidth: "100%",
  },
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start" },
  profileCard: {
    minWidth: 320,
    maxWidth: 400,
    borderRadius: 20,
    padding: 32,
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  avatarContainer: { alignItems: "center", marginBottom: 16 },
  avatarWrapper: {
    position: "relative",
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee",
  },
  editAvatarButton: { position: "absolute", right: 0, bottom: 0, zIndex: 2 },
  editAvatarIconSurface: {
    backgroundColor: "#22223B",
    borderRadius: 16,
    padding: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  name: { fontSize: 28, fontWeight: "bold", marginBottom: 0, color: "#222" },
  editNameIcon: { marginLeft: 4, marginTop: 0 },
  role: { fontSize: 18, color: "#888", marginBottom: 8, textAlign: "center" },
  badge: {
    backgroundColor: "#22223B",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  badgeText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  profileDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  profileDetailsColumn: { marginTop: 12 },
  profileDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailLabel: { color: "#888", fontSize: 15, marginRight: 4 },
  detailValue: { fontSize: 15, color: "#222", fontWeight: "500" },
  summaryCard: {
    flex: 1,
    minWidth: 180,
    borderRadius: 18,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 0,
    padding: 0,
  },
  summaryLabel: { color: "#888", fontSize: 15, fontWeight: "500" },
  summaryValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#222",
    marginVertical: 2,
  },
  summaryChange: { color: "#4CAF50", fontSize: 15, fontWeight: "500" },
  paymentCard: {
    borderRadius: 18,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 0,
    padding: 0,
  },
  paymentTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#222",
  },
  paymentSubtitle: { color: "#888", fontSize: 15, marginBottom: 18 },
  paymentTable: { marginTop: 8 },
  paymentRowHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    gap: 8,
  },
  paymentBarBgHorizontal: {
    flex: 1,
    height: 14,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    overflow: "hidden",
    marginHorizontal: 12,
  },
  paymentBarFillHorizontal: { height: 14, borderRadius: 8 },
  paymentLabel: { fontSize: 17, fontWeight: "600", marginLeft: 0 },
  paymentValue: { fontWeight: "bold", fontSize: 17, marginLeft: 16 },
  paymentPercent: {
    fontWeight: "bold",
    fontSize: 16,
    minWidth: 48,
    textAlign: "right",
    alignSelf: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    margin: 32,
    alignItems: "center",
  },
  nameInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    width: 260,
    backgroundColor: "#fafafa",
  },
});

export default Profile;
