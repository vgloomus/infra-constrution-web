const mash1 = [
  [115.56899882616821, 31.087461576542584, 837.7056395555933],
  [115.56849093514259, 31.087319213071996, 828.6090301109939],
  [115.56881367015082, 31.087244970988706, 838.8096721006433],
  [115.56858090111436, 31.087078234550606, 837.2077765048302],
  [115.5688965974463, 31.08709134343927, 844.8977680247983],
  [115.56861997821053, 31.08683036740106, 844.5000034849055],
  [115.56894958320414, 31.086856809246548, 852.2046838441914],
  [115.56918183201137, 31.087058409787325, 853.1198356850653],
  [115.56918910832651, 31.087333784939826, 846.4166517020263],
  [115.56916542168686, 31.087582657315807, 841.9105734133472],
  [115.56906738630315, 31.0878469236203, 834.3743966421049]
]

const mash2 = [
  [115.56868831668186, 31.089740966880598, 819.8638194536155],
  [115.5693177057079, 31.08962451136686, 854.4879652988466],
  [115.56900653753769, 31.089488425186016, 836.5495128998465],
  [115.56950867339016, 31.089317021326828, 870.5620237207947],
  [115.56907434433832, 31.089032344865778, 839.9058127526051],
  [115.56957334167559, 31.08895938727498, 870.6742510316063],
  [115.56916364035047, 31.088761950220892, 840.8038117871318],
  [115.56968123095925, 31.088651259805424, 873.1952850220476],
  [115.56931479520536, 31.08849529391711, 846.3401611444368],
  [115.56877530368307, 31.088725794475387, 822.6443757338848],
  [115.56868235565904, 31.089210396943493, 818.4586469942211],
  [115.56855053748922, 31.089600756289677, 812.7110140503866],
  [115.56843322233199, 31.090157840758675, 810.559899335866]
]

const mashIndex1 = [
  [1, 3, 5],
  [3, 1, 2],
  [3, 4, 5],
  [4, 3, 2],
  [4, 6, 5],
  [6, 4, 7],
  [4, 8, 7],
  [8, 4, 2],
  [0, 8, 2],
  [8, 0, 9],
  [9, 0, 10],
  [0, 1, 10],
  [1, 0, 2]
]
const mashIndex2 = [
  [8, 1, 4],
  [2, 1, 12],
  [1, 2, 4],
  [10, 11, 9],
  [8, 6, 9],
  [6, 8, 4],
  [6, 2, 9],
  [2, 6, 4],
  [3, 5, 7],
  [5, 3, 1],
  [5, 8, 7],
  [8, 5, 1],
  [0, 10, 9],
  [2, 0, 9],
  [0, 2, 12],
  [11, 0, 12],
  [0, 11, 10]
]

export const getMesh = (index) => {
  const data = index === 1 ? mash1 : mash2
  const ind = index === 1 ? mashIndex1 : mashIndex2
  const newData = []
  ind.forEach((it) => {
    const temp = []
    it.forEach((itx) => {
      temp.push(data[itx])
    })
    const tempMap = temp.map((mp) => {
      return {
        lon: mp[0],
        lat: mp[1],
        alt: mp[2]
      }
    })
    newData.push(tempMap)
  })
  return newData
}
