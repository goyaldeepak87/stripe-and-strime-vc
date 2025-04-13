import NavBar from "@/components/NaveBar";

export default function layout({ children }) {
  return <>
    <NavBar />
    <div className="bg-orange-200 min-h">
      {children}
    </div>
  </>;
}
