import { Platform } from "react-native";

export const SharedStyles = {
  screenContainer: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 16 : 8,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerText: {
    fontWeight: "bold",
  },
  card: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  searchbar: {
    margin: 16,
    elevation: 2,
    borderRadius: 8,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
}; 