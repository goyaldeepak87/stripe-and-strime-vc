import CardCompUI from "@/components/CardCompUI";
import LoginForm from "@/components/LoginForm";
import NaveBar from "@/components/NaveBar";
import {animations} from "@/lang";

export default function Home() {
  return (
    <>
      <NaveBar />
      <div className="flex items-center justify-evenly min-h bg-orange-200">
            {animations.map((values, index) => (
              <CardCompUI key={index} {...values} /> // Replace with the actual path to your JSON animation file
            ))}
      </div>
    </>
  );
}
