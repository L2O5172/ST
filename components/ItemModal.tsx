import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { MenuItem, MenuCategory, Addon, CartItem, DonenessLevel, SelectedAddon, SelectedSauce, SelectedDessert } from '../types';
import { DONENESS_LEVELS, DRINK_CHOICES, SAUCE_CHOICES, DESSERT_CHOICES, ICECREAM_CHOICES } from '../constants';
import { CloseIcon, MinusIcon, PlusIcon } from './icons';

interface ItemModalProps {
  selectedItem: { item: MenuItem, category: MenuCategory };
  editingItem: CartItem | null;
  addons: Addon[];
  onClose: () => void;
  onConfirmSelection: (item: MenuItem, quantity: number, options: any, category: MenuCategory) => void;
}

const ItemModal: React.FC<ItemModalProps> = ({ selectedItem, editingItem, addons, onClose, onConfirmSelection }) => {
  const { item, category } = selectedItem;
  const [quantity, setQuantity] = useState(1);
  const isSteak = !!item.customizations?.doneness;

  const [donenessQuantities, setDonenessQuantities] = useState<Partial<Record<DonenessLevel, number>>>({});
  const [drinkQuantities, setDrinkQuantities] = useState<{ [key: string]: number }>({});
  const [notes, setNotes] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  const [selectedSauces, setSelectedSauces] = useState<SelectedSauce[]>([]);
  const [selectedDesserts, setSelectedDesserts] = useState<SelectedDessert[]>([]);
  const [selectedSingleChoiceAddon, setSelectedSingleChoiceAddon] = useState<string | null>(null);
  const [multiChoiceQuantities, setMultiChoiceQuantities] = useState<{ [key: string]: number }>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (editingItem) {
      setQuantity(editingItem.quantity);
      setDonenessQuantities(editingItem.selectedDonenesses || {});
      setDrinkQuantities(editingItem.selectedDrinks || {});
      setSelectedSauces(editingItem.selectedSauces || []);
      setSelectedAddons(editingItem.selectedAddons || []);
      setSelectedDesserts(editingItem.selectedDesserts || []);
      setNotes(editingItem.selectedNotes || '');
      setSelectedSingleChoiceAddon(editingItem.selectedSingleChoiceAddon || null);
      setMultiChoiceQuantities(editingItem.selectedMultiChoice || {});
    } else {
      setQuantity(1);
      setDonenessQuantities({});
      setDrinkQuantities({});
      setSelectedSauces([]);
      setSelectedAddons([]);
      setSelectedDesserts([]);
      setNotes('');
      setSelectedSingleChoiceAddon(null);
      setMultiChoiceQuantities({});
    }
    setValidationErrors([]); // Reset errors when modal opens or item changes
  }, [editingItem, selectedItem]);

  const allocatedDonenessCount = useMemo(() => Object.values(donenessQuantities).reduce((sum: number, count) => sum + (count || 0), 0), [donenessQuantities]);
  const allocatedDrinkCount = useMemo(() => Object.values(drinkQuantities).reduce((sum: number, count) => sum + (count || 0), 0), [drinkQuantities]);
  const allocatedMultiChoiceCount = useMemo(() => Object.values(multiChoiceQuantities).reduce((sum: number, count) => sum + (count || 0), 0), [multiChoiceQuantities]);
  
  const saucesPerItem = item.customizations?.saucesPerItem ?? 2;
  const totalSauceLimit = quantity * saucesPerItem;
  const totalSauceCount = useMemo(() => selectedSauces.reduce((sum, sauce) => sum + sauce.quantity, 0), [selectedSauces]);

  const isDessertSelectionItem = useMemo(() => !!item.customizations?.dessertChoice, [item.customizations]);
  const totalDessertGroupA = useMemo(() => selectedDesserts.filter(d => DESSERT_CHOICES.includes(d.name)).reduce((sum, d) => sum + d.quantity, 0), [selectedDesserts]);
  const totalDessertGroupB = useMemo(() => selectedDesserts.filter(d => ICECREAM_CHOICES.includes(d.name)).reduce((sum, d) => sum + d.quantity, 0), [selectedDesserts]);

  const addonGroups = useMemo(() => {
    return addons.reduce((acc, addon) => {
      (acc[addon.category] = acc[addon.category] || []).push(addon);
      return acc;
    }, {} as { [key: string]: Addon[] });
  }, [addons]);
  
  const mainCourseAddonCategory = '主餐加購';
  const otherAddonGroups = useMemo(() => 
      Object.entries(addonGroups).filter(([categoryName]) => categoryName !== mainCourseAddonCategory) as [string, Addon[]][]
  , [addonGroups]);
  const mainCourseAddonGroup = useMemo(() => 
      Object.entries(addonGroups).find(([categoryName]) => categoryName === mainCourseAddonCategory) as [string, Addon[]] | undefined
  , [addonGroups]);


  const handleDonenessChange = useCallback((doneness: DonenessLevel, change: number) => {
    setDonenessQuantities(prev => {
        const newQuantities = { ...prev };
        const currentCount = newQuantities[doneness] || 0;
        const newCount = currentCount + change;
        
        if (newCount < 0) return prev;
        if (change > 0 && allocatedDonenessCount >= quantity) return prev;

        if (newCount === 0) {
            delete newQuantities[doneness];
        } else {
            newQuantities[doneness] = newCount;
        }
        return newQuantities;
    });
  }, [allocatedDonenessCount, quantity]);

  const handleDrinkChange = useCallback((drink: string, change: number) => {
    setDrinkQuantities(prev => {
        const newQuantities = { ...prev };
        const currentCount = newQuantities[drink] || 0;
        const newCount = currentCount + change;
        
        if (newCount < 0) return prev;
        if (change > 0 && allocatedDrinkCount >= quantity) return prev;
        
        if (newCount === 0) {
            delete newQuantities[drink];
        } else {
            newQuantities[drink] = newCount;
        }
        return newQuantities;
    });
  }, [allocatedDrinkCount, quantity]);

  const handleMultiChoiceChange = useCallback((option: string, change: number) => {
    setMultiChoiceQuantities(prev => {
        const newQuantities = { ...prev };
        const currentCount = newQuantities[option] || 0;
        const newCount = currentCount + change;
        
        if (newCount < 0) return prev;
        if (change > 0 && allocatedMultiChoiceCount >= quantity) return prev;
        
        if (newCount === 0) {
            delete newQuantities[option];
        } else {
            newQuantities[option] = newCount;
        }
        return newQuantities;
    });
  }, [allocatedMultiChoiceCount, quantity]);


  const handleAddonQuantityChange = useCallback((addon: Addon, change: number) => {
    if (!addon.isAvailable && change > 0) return;
    setSelectedAddons(prev => {
      const existingAddon = prev.find(a => a.id === addon.id);
      if (existingAddon) {
        const newQuantity = existingAddon.quantity + change;
        return newQuantity <= 0 ? prev.filter(a => a.id !== addon.id) : prev.map(a => a.id === addon.id ? { ...a, quantity: newQuantity } : a);
      } else if (change > 0) {
        return [...prev, { ...addon, quantity: change }];
      }
      return prev;
    });
  }, []);

  const handleSauceChange = useCallback((sauceName: string, change: number) => {
    setSelectedSauces(prev => {
      const existingSauce = prev.find(s => s.name === sauceName);
      if (existingSauce) {
        const newQuantity = existingSauce.quantity + change;
        if (newQuantity < 0) return prev;
        if (totalSauceCount >= totalSauceLimit && change > 0) return prev;
        if (newQuantity === 0) return prev.filter(s => s.name !== sauceName);
        return prev.map(s => s.name === sauceName ? { ...s, quantity: newQuantity } : s);
      } else if (change > 0 && totalSauceCount < totalSauceLimit) {
        return [...prev, { name: sauceName, quantity: 1 }];
      }
      return prev;
    });
  }, [totalSauceCount, totalSauceLimit]);
  
  const handleDessertChange = useCallback((dessertName: string, change: number) => {
    setSelectedDesserts(prev => {
        if (isDessertSelectionItem && change > 0) {
            const isGroupA = DESSERT_CHOICES.includes(dessertName);
            if (isGroupA && totalDessertGroupA >= quantity) return prev;
            if (!isGroupA && totalDessertGroupB >= quantity) return prev;
        }

        const existingDessert = prev.find(s => s.name === dessertName);
        if (existingDessert) {
            const newQuantity = existingDessert.quantity + change;
            if (newQuantity <= 0) {
                return prev.filter(s => s.name !== dessertName);
            }
            return prev.map(s => s.name === dessertName ? { ...s, quantity: newQuantity } : s);
        } else if (change > 0) {
            return [...prev, { name: dessertName, quantity: 1 }];
        }
        return prev;
    });
  }, [isDessertSelectionItem, quantity, totalDessertGroupA, totalDessertGroupB]);

  const handleSubmit = () => {
    const errors: string[] = [];

    if (isSteak && allocatedDonenessCount !== quantity) {
      errors.push(`牛排熟度：請分配所有 ${quantity} 份餐點的熟度。`);
    }
    if (item.customizations?.drinkChoice && allocatedDrinkCount !== quantity) {
      errors.push(`飲料：請選擇所有 ${quantity} 份餐點的飲料。`);
    }
    if (item.customizations?.sauceChoice && totalSauceCount !== totalSauceLimit) {
      errors.push(`主菜沾醬：請為 ${quantity} 份餐點選擇共 ${totalSauceLimit} 份沾醬。`);
    }
    if (item.customizations?.multiChoice && allocatedMultiChoiceCount !== quantity) {
      errors.push(`${item.customizations.multiChoice.title}：請為 ${quantity} 份餐點分配選項。`);
    }
    if (isDessertSelectionItem && (totalDessertGroupA !== quantity || totalDessertGroupB !== quantity)) {
      errors.push(`甜品選擇：請為 ${quantity} 份餐點，在A區和B區各選擇 ${quantity} 樣甜品。`);
    }

    setValidationErrors(errors);

    if (errors.length > 0) {
      return;
    }

    const options = { 
        donenesses: donenessQuantities,
        drinks: drinkQuantities,
        addons: selectedAddons, 
        sauces: selectedSauces, 
        desserts: selectedDesserts,
        notes: notes.trim(),
        singleChoiceAddon: selectedSingleChoiceAddon,
        multiChoice: multiChoiceQuantities,
    };
    onConfirmSelection(item, quantity, options, category);
    onClose();
  };
  
  const singleChoiceAddonPrice = useMemo(() => {
    if (selectedSingleChoiceAddon && item.customizations.singleChoiceAddon) {
      return item.customizations.singleChoiceAddon.price;
    }
    return 0;
  }, [selectedSingleChoiceAddon, item.customizations.singleChoiceAddon]);

  const totalAddonPrice = selectedAddons.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);
  const totalPrice = (item.price + singleChoiceAddonPrice) * quantity + totalAddonPrice;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-6 relative border-b">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"><CloseIcon /></button>
          <h2 className="text-2xl font-bold text-slate-800">{item.name.replace(/半全餐|半套餐/g, '套餐')}{item.weight && ` (${item.weight})`}</h2>
          <p className="text-xl font-semibold text-green-700 mt-2">${item.price}</p>
        </header>
        <main className="px-6 py-4 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-700">數量</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 rounded-full bg-slate-200 hover:bg-slate-300"><MinusIcon /></button>
              <span className="text-xl font-bold w-12 text-center">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="p-2 rounded-full bg-slate-200 hover:bg-slate-300"><PlusIcon /></button>
            </div>
          </div>
          
          {item.customizations.multiChoice && (
             <div>
                <div className="flex justify-between items-baseline mb-3">
                  <h3 className="text-lg font-semibold text-slate-700">{item.customizations.multiChoice.title}*</h3>
                  <span className={`font-semibold ${allocatedMultiChoiceCount === quantity ? 'text-green-600' : 'text-red-500'}`}>已分配 {allocatedMultiChoiceCount} / {quantity}</span>
                </div>
                <div className="space-y-3">
                  {item.customizations.multiChoice.options.map(option => (
                    <div key={option} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                      <span className="font-medium text-slate-800">{option}</span>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleMultiChoiceChange(option, -1)} className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300"><MinusIcon className="h-4 w-4" /></button>
                        <span className="text-lg font-semibold w-8 text-center">{multiChoiceQuantities[option] || 0}</span>
                        <button onClick={() => handleMultiChoiceChange(option, 1)} className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300" disabled={allocatedMultiChoiceCount >= quantity}><PlusIcon className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          )}

          {item.customizations.singleChoiceAddon && (
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-3">
                單點加購 <span className="font-normal text-base">(+${item.customizations.singleChoiceAddon.price})</span>
              </h3>
              <div className="space-y-2">
                <label htmlFor="single-choice-none" className="flex items-center bg-slate-50 p-3 rounded-lg cursor-pointer">
                  <input
                    id="single-choice-none"
                    type="radio"
                    name="single-choice-addon"
                    checked={!selectedSingleChoiceAddon}
                    onChange={() => setSelectedSingleChoiceAddon(null)}
                    className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <span className="ml-3 block font-medium text-slate-900">不需要</span>
                </label>
                {item.customizations.singleChoiceAddon.options.map(option => (
                  <label key={option} htmlFor={`single-choice-${option}`} className="flex items-center bg-slate-50 p-3 rounded-lg cursor-pointer">
                    <input
                      id={`single-choice-${option}`}
                      type="radio"
                      name="single-choice-addon"
                      value={option}
                      checked={selectedSingleChoiceAddon === option}
                      onChange={() => setSelectedSingleChoiceAddon(option)}
                      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <span className="ml-3 block font-medium text-slate-900">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {isSteak && (
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <h3 className="text-lg font-semibold text-slate-700">牛排熟度*</h3>
                <span className={`font-semibold ${allocatedDonenessCount === quantity ? 'text-green-600' : 'text-red-500'}`}>已分配 {allocatedDonenessCount} / {quantity}</span>
              </div>
              <div className="space-y-3">
                {DONENESS_LEVELS.map(d => (
                  <div key={d} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                    <span className="font-medium text-slate-800">{d}</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleDonenessChange(d, -1)} className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300"><MinusIcon className="h-4 w-4" /></button>
                      <span className="text-lg font-semibold w-8 text-center">{donenessQuantities[d] || 0}</span>
                      <button onClick={() => handleDonenessChange(d, 1)} className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300" disabled={allocatedDonenessCount >= quantity}><PlusIcon className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {item.customizations?.drinkChoice && (
            <div>
                <div className="flex justify-between items-baseline mb-3">
                    <h3 className="text-lg font-semibold text-slate-700">飲料*</h3>
                    <span className={`font-semibold ${allocatedDrinkCount === quantity ? 'text-green-600' : 'text-red-500'}`}>已選擇 {allocatedDrinkCount} / {quantity}</span>
                </div>
                <div className="space-y-3">
                    {DRINK_CHOICES.map(drink => (
                        <div key={drink} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                            <span className="font-medium text-slate-800">{drink}</span>
                            <div className="flex items-center gap-3">
                                <button onClick={() => handleDrinkChange(drink, -1)} className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300"><MinusIcon className="h-4 w-4" /></button>
                                <span className="text-lg font-semibold w-8 text-center">{drinkQuantities[drink] || 0}</span>
                                <button onClick={() => handleDrinkChange(drink, 1)} className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300" disabled={allocatedDrinkCount >= quantity}><PlusIcon className="h-4 w-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}
          {item.customizations?.sauceChoice && (
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <h3 className="text-lg font-semibold text-slate-700">主菜沾醬 (每份選{saucesPerItem})*</h3>
                <span className={`font-semibold ${totalSauceCount === totalSauceLimit ? 'text-green-600' : 'text-red-500'}`}>已選 {totalSauceCount} / {totalSauceLimit}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SAUCE_CHOICES.map(sauce => (
                  <div key={sauce} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                    <span className="font-medium text-slate-800 text-sm">{sauce}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleSauceChange(sauce, -1)} className="p-1 rounded-full bg-slate-200 hover:bg-slate-300"><MinusIcon className="h-4 w-4" /></button>
                      <span className="text-md font-semibold w-5 text-center">{selectedSauces.find(s => s.name === sauce)?.quantity || 0}</span>
                      <button onClick={() => handleSauceChange(sauce, 1)} className="p-1 rounded-full bg-slate-200 hover:bg-slate-300" disabled={totalSauceCount >= totalSauceLimit}><PlusIcon className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {item.customizations?.dessertChoice && (
            <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-3">甜品選擇</h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-baseline mb-2 pl-2">
                            <h4 className="text-md font-semibold text-slate-600">A區 - 任選一種↓*</h4>
                            {isDessertSelectionItem && <span className={`font-semibold ${totalDessertGroupA === quantity ? 'text-green-600' : 'text-red-500'}`}>已選 {totalDessertGroupA} / {quantity}</span>}
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {DESSERT_CHOICES.map(dessert => (
                                <div key={dessert} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                                    <span className="font-medium text-slate-800 text-sm">{dessert}</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleDessertChange(dessert, -1)} className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300"><MinusIcon className="h-4 w-4" /></button>
                                        <span className="text-lg font-semibold w-6 text-center">{selectedDesserts.find(d => d.name === dessert)?.quantity || 0}</span>
                                        <button onClick={() => handleDessertChange(dessert, 1)} className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300" disabled={isDessertSelectionItem && totalDessertGroupA >= quantity}><PlusIcon className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-baseline mb-2 pl-2">
                            <h4 className="text-md font-semibold text-slate-600">B區 - 任選一種↓*</h4>
                            {isDessertSelectionItem && <span className={`font-semibold ${totalDessertGroupB === quantity ? 'text-green-600' : 'text-red-500'}`}>已選 {totalDessertGroupB} / {quantity}</span>}
                        </div>
                         <div className="grid grid-cols-1 gap-3">
                            {ICECREAM_CHOICES.map(dessert => (
                                <div key={dessert} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                                    <span className="font-medium text-slate-800 text-sm">{dessert}</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleDessertChange(dessert, -1)} className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300"><MinusIcon className="h-4 w-4" /></button>
                                        <span className="text-lg font-semibold w-6 text-center">{selectedDesserts.find(d => d.name === dessert)?.quantity || 0}</span>
                                        <button onClick={() => handleDessertChange(dessert, 1)} className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300" disabled={isDessertSelectionItem && totalDessertGroupB >= quantity}><PlusIcon className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          )}
          {otherAddonGroups.map(([categoryName, addonList]) => (
            <div key={categoryName}>
              <h3 className="text-lg font-semibold text-slate-700 mb-3">{categoryName}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addonList.map(addon => (
                  <div key={addon.id} className={`flex items-center justify-between p-3 rounded-md ${addon.isAvailable ? 'bg-slate-100' : 'bg-slate-200 opacity-60'}`}>
                    <div>
                      <span className={`text-slate-800 text-sm ${!addon.isAvailable ? 'line-through' : ''}`}>{addon.name}</span>
                      <span className="ml-2 font-semibold text-slate-500 text-sm">+${addon.price}</span>
                      {!addon.isAvailable && <span className="ml-2 text-red-500 text-xs font-bold">售完</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleAddonQuantityChange(addon, -1)} className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300 disabled:bg-slate-300" disabled={!addon.isAvailable}><MinusIcon className="h-4 w-4" /></button>
                      <span className="text-lg font-semibold w-6 text-center">{selectedAddons.find(a => a.id === addon.id)?.quantity || 0}</span>
                      <button onClick={() => handleAddonQuantityChange(addon, 1)} className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300 disabled:bg-slate-300" disabled={!addon.isAvailable}><PlusIcon className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
           {item.customizations?.notes && (
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-3">備註</h3>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="有任何特殊需求嗎？" className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"></textarea>
            </div>
          )}
          {mainCourseAddonGroup && (
            <div key={mainCourseAddonGroup[0]}>
              <h3 className="text-lg font-semibold text-slate-700 mb-3">{mainCourseAddonGroup[0]}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mainCourseAddonGroup[1].map(addon => (
                  <div key={addon.id} className={`flex items-center justify-between p-3 rounded-md ${addon.isAvailable ? 'bg-slate-100' : 'bg-slate-200 opacity-60'}`}>
                    <div>
                      <span className={`text-slate-800 text-sm ${!addon.isAvailable ? 'line-through' : ''}`}>{addon.name}</span>
                      <span className="ml-2 font-semibold text-slate-500 text-sm">+${addon.price}</span>
                      {!addon.isAvailable && <span className="ml-2 text-red-500 text-xs font-bold">售完</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleAddonQuantityChange(addon, -1)} className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300 disabled:bg-slate-300" disabled={!addon.isAvailable}><MinusIcon className="h-4 w-4" /></button>
                      <span className="text-lg font-semibold w-6 text-center">{selectedAddons.find(a => a.id === addon.id)?.quantity || 0}</span>
                      <button onClick={() => handleAddonQuantityChange(addon, 1)} className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300 disabled:bg-slate-300" disabled={!addon.isAvailable}><PlusIcon className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
        <footer className="p-6 border-t bg-slate-50">
          {validationErrors.length > 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
              <strong className="font-bold">請完成以下必填選項：</strong>
              <ul className="mt-2 list-disc list-inside text-sm">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
              <button
                onClick={() => setValidationErrors([])}
                className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-200 rounded-lg transition-colors"
                aria-label="關閉提示"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
          )}
          <button onClick={handleSubmit} className="w-full bg-green-600 text-white font-bold py-4 px-4 rounded-lg hover:bg-green-700 transition-colors text-lg">
            {editingItem ? `更新 ${totalPrice} 到購物車` : `加入 ${totalPrice} 到購物車`}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ItemModal;
