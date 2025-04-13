import NavBar from "@/components/NaveBar";

export default function layout({ children }) {
  return <>
    <NavBar />
    {children}
  </>;
}
