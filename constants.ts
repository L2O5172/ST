import type { MenuCategory, Addon } from './types';

export const MENU_DATA: MenuCategory[] = [
  {
    title: "簡餐",
    items: [
        { id: 'new-nuggets-single', name: '黃金脆皮炸雞塊', price: 75, description: "單點。可於下方選擇加購。", customizations: { notes: true, sauceChoice: true, saucesPerItem: 1 }, isAvailable: true },
        { id: 'new-nuggets-set', name: '雞塊套餐', price: 175, description: "附: 湯品, 飲料, 脆薯, 甜品", customizations: { notes: true, sauceChoice: true, saucesPerItem: 1, drinkChoice: true }, isAvailable: true },
        { id: 'new-peanut-burger-single', name: '波士頓花生冰淇淋吃到堡', price: 75, description: "單點。可於下方選擇加購。", customizations: { notes: true }, isAvailable: true },
        { id: 'new-peanut-burger-set', name: '花生冰淇淋吃到堡套餐', price: 175, description: "附: 湯品, 飲料, 脆薯, 雞塊", customizations: { notes: true, drinkChoice: true }, isAvailable: true },
        { id: 'new-eggsalad-burger-single', name: '蛋沙拉脆皮雞塊吃到堡', price: 75, description: "單點。可於下方選擇加購。", customizations: { notes: true }, isAvailable: true },
        { id: 'new-eggsalad-burger-set', name: '蛋沙拉脆皮雞塊吃到堡套餐', price: 175, description: "附: 湯品, 飲料, 脆薯, 甜品", customizations: { notes: true, drinkChoice: true }, isAvailable: true },
        { id: 'new-kimchi-burger-single', name: '黃金泡菜脆皮雞塊吃到堡', price: 75, description: "單點。可於下方選擇加購。", customizations: { notes: true }, isAvailable: true },
        { id: 'new-kimchi-burger-set', name: '黃金泡菜脆皮雞塊吃到堡套餐', price: 175, description: "附: 湯品, 飲料, 脆薯, 甜品", customizations: { notes: true, drinkChoice: true }, isAvailable: true },
        { id: 'new-waldorf-burger-single', name: '華道夫蘋果沙拉雞塊吃到堡', price: 75, description: "單點。可於下方選擇加購。", customizations: { notes: true }, isAvailable: true },
        { id: 'new-waldorf-burger-set', name: '華道夫蘋果沙拉雞塊吃到堡套餐', price: 175, description: "附: 湯品, 飲料, 脆薯, 甜品", customizations: { notes: true, drinkChoice: true }, isAvailable: true },
        { id: 'new-cold-noodle-single', name: '是日涼麵', price: 75, description: "單點。可於下方選擇加購。", customizations: { multiChoice: { title: '涼麵口味', options: ['台式', '泰式', '日式', '法式'] }, notes: true }, isAvailable: true },
        { id: 'new-cold-noodle-set', name: '涼麵套餐', price: 175, description: "附: 湯品, 飲料, 脆薯, 雞塊", customizations: { multiChoice: { title: '涼麵口味', options: ['台式', '泰式', '日式', '法式'] }, drinkChoice: true, notes: true }, isAvailable: true },
        { id: 'new-chicken-porridge-drink', name: '脆皮炸雞塊+粥品+飲料', description: "超值組合", price: 99, customizations: { drinkChoice: true, notes: true, sauceChoice: true, saucesPerItem: 1 }, isAvailable: true },
    ]
  },
  {
    title: "甜品",
    items: [
        { id: 'new-dessert-choice-single', name: '任選甜品', price: 99, description: "A、B區各任選一種。可於下方選擇加購。", customizations: { dessertChoice: true, notes: true }, isAvailable: true },
        { id: 'new-dessert-choice-set', name: '任選甜品套餐', price: 199, description: "附: 湯品, 飲料, 脆薯, 雞塊", customizations: { dessertChoice: true, drinkChoice: true, notes: true }, isAvailable: true },
    ]
  },
  {
    title: "套餐",
    items: [
      { id: 'set-1', name: '香煎海盜牛排套餐', weight: '7oz', price: 299, description: "附: ①日湯 ②麵包 ③主餐 ④脆薯 ⑤飲料", customizations: { doneness: true, sauceChoice: true, drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'set-2', name: '香煎海盜牛排套餐', weight: '14oz', price: 399, description: "附: ①日湯 ②麵包 ③主餐 ④脆薯 ⑤飲料", customizations: { doneness: true, sauceChoice: true, drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'set-3', name: '香煎海盜牛排套餐', weight: '21oz', price: 499, description: "附: ①日湯 ②麵包 ③主餐 ④脆薯 ⑤飲料", customizations: { doneness: true, sauceChoice: true, drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'set-4', name: '香煎特選板腱套餐', weight: '10oz', price: 399, description: "附: ①日湯 ②麵包 ③主餐 ④脆薯 ⑤飲料", customizations: { doneness: true, sauceChoice: true, drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'set-5', name: '香煎老饕上蓋套餐', weight: '7oz', price: 399, description: "附: ①日湯 ②麵包 ③主餐 ④脆薯 ⑤飲料", customizations: { doneness: true, sauceChoice: true, drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'set-6', name: '香煎紐菲力套餐', weight: '7oz', price: 499, description: "附: ①日湯 ②麵包 ③主餐 ④脆薯 ⑤飲料", customizations: { doneness: true, sauceChoice: true, drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'set-7', name: '香煎櫻桃鴨胸套餐', weight: '10oz', price: 320, description: "附: ①日湯 ②麵包 ③主餐 ④脆薯 ⑤飲料", customizations: { doneness: false, sauceChoice: true, drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'set-8', name: '香煎鮮嫩鱸魚套餐', weight: '10oz', price: 320, description: "附: ①日湯 ②麵包 ③主餐 ④脆薯 ⑤飲料", customizations: { doneness: false, sauceChoice: true, drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'set-9', name: '香煎鮮嫩雞腿套餐', weight: '10oz', price: 250, description: "附: ①日湯 ②麵包 ③主餐 ④脆薯 ⑤飲料", customizations: { doneness: false, sauceChoice: true, drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'set-10', name: '香煎美味豬排套餐', weight: '10oz', price: 299, description: "附: ①日湯 ②麵包 ③主餐 ④脆薯 ⑤飲料", customizations: { doneness: false, sauceChoice: true, drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'set-11', name: '英式炸魚套餐', weight: '10oz', price: 250, description: "附: ①日湯 ②麵包 ③主餐 ④脆薯 ⑤飲料", customizations: { doneness: false, sauceChoice: true, drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'set-12', name: '日式豬排套餐', weight: '10oz', price: 250, description: "附: ①日湯 ②麵包 ③主餐 ④脆薯 ⑤飲料", customizations: { doneness: false, sauceChoice: true, drinkChoice: true, notes: true }, isAvailable: false },
    ]
  },
  {
    title: "組合餐",
    items: [
      { id: 'combo-1', name: '日豬、雞腿、上蓋組合餐', weight: '15oz', price: 529, description: "附: ①日湯 ②麵包 ③主餐 ④脆薯 ⑤沙拉 ⑥飲料", customizations: { doneness: true, sauceChoice: true, drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'combo-2', name: '炸魚、雞腿、板腱組合餐', weight: '15oz', price: 529, description: "附: ①日湯 ②麵包 ③主餐 ④脆薯 ⑤沙拉 ⑥飲料", customizations: { doneness: true, sauceChoice: true, drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'combo-3', name: '鱸魚、鴨胸、豬排組合餐', weight: '15oz', price: 529, description: "附: ①日湯 ②麵包 ③主餐 ④脆薯 ⑤沙拉 ⑥飲料", customizations: { doneness: false, sauceChoice: true, drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'combo-4', name: '鴨胸、鱸魚、上蓋組合餐', weight: '15oz', price: 599, description: "附: ①日湯 ②麵包 ③主餐 ④脆薯 ⑤沙拉 ⑥飲料", customizations: { doneness: true, sauceChoice: true, drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'combo-5', name: 'N菲、上蓋、板腱組合餐', weight: '15oz', price: 699, description: "附: ①日湯 ②麵包 ③主餐 ④脆薯 ⑤沙拉 ⑥飲料", customizations: { doneness: true, sauceChoice: true, drinkChoice: true, notes: true }, isAvailable: true },
      { id: 'new-chicken-pasta-single', name: '黃金脆皮炸雞塊+是日義大利天使麵', price: 140, description: "單點", customizations: { notes: true, sauceChoice: true, saucesPerItem: 1 }, isAvailable: true },
      { id: 'new-chicken-pasta-set', name: '黃金脆皮炸雞塊+是日義大利天使麵套餐', price: 220, description: "附: 湯品, 飲料", customizations: { drinkChoice: true, notes: true, sauceChoice: true, saucesPerItem: 1 }, isAvailable: true },
    ]
  }
];

export const ADDONS: Addon[] = [
    { id: 'addon-top-blade-5oz', name: '板腱加購 5oz', price: 200, category: '主餐加購', isAvailable: true },
    { id: 'addon-ribeye-cap-5oz', name: '上蓋加購 5oz', price: 200, category: '主餐加購', isAvailable: true },
    { id: 'addon-duck-breast-5oz', name: '鴨胸加購 5oz', price: 150, category: '主餐加購', isAvailable: true },
    { id: 'addon-sea-bass-5oz', name: '鱸魚加購 5oz', price: 150, category: '主餐加購', isAvailable: true },
    { id: 'addon-chicken-leg-5oz', name: '雞腿加購 5oz', price: 120, category: '主餐加購', isAvailable: true },
    { id: 'addon-pork-chop-5oz', name: '豬排加購 5oz', price: 120, category: '主餐加購', isAvailable: true },
    { id: 'addon-jp-pork-cutlet-5oz', name: '日豬加購 5oz', price: 120, category: '主餐加購', isAvailable: true },
    { id: 'addon-fried-fish-5oz', name: '炸魚加購 5oz', price: 120, category: '主餐加購', isAvailable: true },
    { id: 'addon-soup', name: '湯品 加購', price: 30, category: '單點加購', isAvailable: true },
    { id: 'addon-congee', name: '粥品 加購', price: 40, category: '單點加購', isAvailable: true },
    { id: 'addon-fries', name: '脆薯 加購', price: 40, category: '單點加購', isAvailable: true },
    { id: 'addon-dessert-side', name: '甜品 加購', price: 40, category: '單點加購', isAvailable: true },
    { id: 'addon-drink-side', name: '飲料 加購', price: 20, category: '單點加購', isAvailable: true },
    { id: 'addon-nuggets-side', name: '雞塊 加購', price: 45, category: '單點加購', isAvailable: true },
];

export const DONENESS_LEVELS = ['3分熟', '5分熟', '7分熟', '全熟'] as const;
export const SAUCE_CHOICES = ["巴醋", "橙汁", "椒鹽", "芥末", "泡菜", "BBQ醬", "黑胡椒", "蒜味醬"];
export const DRINK_CHOICES = ["無糖紅茶", "冰涼可樂"];

// New dessert choices
export const DESSERT_CHOICES = ["蜜糖潛艇堡", "美式鬆餅", "格子鬆餅", "法式鬆餅", "蜜糖吐司"];
export const ICECREAM_CHOICES = ["法式烤布蕾佐冰淇淋", "阿薩斯蘋果佐冰淇淋", "烤蜜糖香蕉佐冰淇淋", "融岩巧克力佐冰淇淋", "醇巧克力暮司佐冰淇", "烤法焦糖布丁佐冰淇", "宜蘭鮮乳奶凍佐冰淇", "宇治紫米紅豆冰淇淋"];