import animationData1 from '@/components/images/Animation.json';
import animationData2 from '@/components/images/Animation2.json';
import animationData3 from '@/components/images/Animation3.json';
import animationData4 from '@/components/images/Animation4.json';

export const animations = [
    {
        id: 1,
        label: "Card1",
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
        label: "Card2",
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
        label: "Card3",
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