import { Redirect } from "expo-router";

// Never actually reached — the "add" tab's tabPress is intercepted in
// _layout.tsx and its button navigates to /subscription/add instead. This
// stub only exists as a safety net for react-navigation's own state restore.
export default function AddTabStub() {
  return <Redirect href="/dashboard" />;
}
