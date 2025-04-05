import animationData1 from '@/components/images/Animation.json';
import animationData2 from '@/components/images/Animation2.json';
import animationData3 from '@/components/images/Animation3.json';
import animationData4 from '@/components/images/Animation4.json';
import loader from '@/components/images/Loader.json';
import success from '@/components/images/success.json';
import videocall from '@/components/images/videocall.json';

export const animations = [
    {
        id: 1,
        active: true,
        prodectId:"ReTiChat11",
        title: "Real - Time Stream Chat",
        label: "Live Chat Feature",
        text:"Engage with your audience instantly using our live stream chat feature. Perfect for creators, teachers, or hosts who want real-time interaction during any broadcast or live session.",
        price: "$5",
        leftShift: "1/2",
        topShift: "15",
        lftShiftIline: "125",
        topShiftIline: "60",
        animation: {
            img: animationData1,
            width: 120,
            height: 120,
        }
    },
    {
        id: 2,
        active: false,
        prodectId:"ViCaLiComments12",
        title: "Video Call & Live Comments",
        label: "Interactive Video Call",
        text:" seamless video calls with the added power of live commenting. Collaborate, teach, or connect with multiple users while engaging them through real-time feedback and chat interactions.",
        price: "$12",
        leftShift: "25",
        topShift: "15",
        topShiftIline: "61",
        lftShiftIline: "110",
        animation: {
            img: animationData2,
            width: 190,
            height: 140,
        }

    },
    {
        id: 3,
        active: true,
        prodectId:"ScSharCalls13",
        title: "Screen Sharing in Calls",
        label: "Screen Share Tool",
        text:"Share your screen effortlessly during video calls. Ideal for presentations, demos, remote support, or online teaching — make your sessions more interactive and visually rich.",
        price: "$18",
        leftShift: "20",
        lftShiftIline: "75",
        topShiftIline: "75",
        animation: {
            img: animationData3,
            width: 226,
            height: 134,
        }
    },
];


export const LoginData = {
    animation: {
        img: animationData4,
        width: 330,
        height: 330,
    }
}

export const successPayment = {
    animation: {
        img: success,
        width: 330,
        height: 330,
    }
}
export const LoaderData = {
    animation: {
        img: loader,
        width: 110,
        height: 24,
    }
}

export const VideocallData = {
    animation: {
        img: videocall,
        width: 150,
        height: 130,
    }
}

export const SignupData = [
  {
    id: 1,
    icon: "https://www.svgrepo.com/show/355037/google.svg",
    label: "Google",
  },
  {
    id: 2,
    icon: "https://www.svgrepo.com/show/157818/facebook.svg",
    label: "Facebook",
  }
]