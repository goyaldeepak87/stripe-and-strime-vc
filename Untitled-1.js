/* unshift method Array
unnshift method is used add the specifide the element bigning of the array
*/
// let arr = [10, 20, 30, 40, 50]
// console.log(arr.unshift(1,2))
// console.log(arr)

/* reduce method Array
reduce method is powerfull and versetile array function used to process the element of the array and reduce them singal accmulated of the value  
*/

// function removeDuplicates(arr) {
//     let newarr = []
//     for (let i = 0; i < arr.length; i++) {
//         console.log(i)
//         let removeduplicate = false;
//         for (let j = 0; j < newarr.length; j++) {
//             if (arr[i] == newarr[j]) {
//                 removeduplicate = true;
//                 break
//             }
//         }
//         if (!removeduplicate) {
//             newarr = [...newarr, arr[i]]
//         }
//     }
//     return newarr
// }

// console.log(removeDuplicates([10, 10, 20, 30, 40, 40, 50, 20, 50]))

// console.log([...new Set([10, 10, 20, 30, 40, 40, 50, 20, 50])])


// function countFrequency(arr) {
//     let obj = {}
//     for(let i=0; i<arr.length; i++){
//       if(obj[arr[i]]){
//         obj[arr[i]] += 1
//       }else{
//         obj[arr[i]] = 1
//       }

//     }
//     return obj
//   }
// console.log(  countFrequency([10,20,30,10,30,30,50]))


function secondLargest(arr) {
    let min = Infinity
    let minsec = Infinity
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] < min) {
            sec = min
            min = arr[i]
        } else if (arr[i] < minsec) {
            minsec = arr[i]
        }
    }
    return {minsec, min}
}

console.log(secondLargest([-50, 10, 20, 80, 30, 75, 70, 70]))










