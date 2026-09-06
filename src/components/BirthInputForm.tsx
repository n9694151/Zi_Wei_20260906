/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BirthInput } from '../ziwei/types/chart';
import { Calendar, Clock, MapPin, User, Sparkles } from 'lucide-react';

interface BirthInputFormProps {
  initialInput: BirthInput;
  onSubmit: (input: BirthInput) => void;
  onQuickLoadGolden: () => void;
}

export const BirthInputForm: React.FC<BirthInputFormProps> = ({
  initialInput,
  onSubmit,
  onQuickLoadGolden,
}) => {
  const [formData, setFormData] = useState<BirthInput>(initialInput);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      id="birth-input-form"
      onSubmit={handleSubmit}
      className="bg-[#111827] rounded-xl p-4 sm:p-6 border border-slate-800 shadow-xl space-y-4 text-slate-200"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <User className="w-5 h-5 text-amber-500" />
          <h3 className="font-serif font-bold text-lg text-white">排盤出生資料設定</h3>
        </div>
        <button
          type="button"
          onClick={onQuickLoadGolden}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          填入黃金測試 #001
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">姓名 / 命造標識</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-sm"
            placeholder="例如：王小明"
            required
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">性別（影響大限順逆）</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: 'male' })}
              className={`flex-1 py-2 rounded-lg font-semibold text-xs border transition-colors ${
                formData.gender === 'male'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              乾造（男）
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: 'female' })}
              className={`flex-1 py-2 rounded-lg font-semibold text-xs border transition-colors ${
                formData.gender === 'female'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              坤造（女）
            </button>
          </div>
        </div>

        {/* Solar Date */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">陽曆出生日期</label>
          <div className="relative">
            <input
              type="date"
              value={formData.solarDate}
              onChange={(e) => setFormData({ ...formData, solarDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-sm [color-scheme:dark]"
              required
            />
          </div>
        </div>

        {/* Birth Time */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">出生時間 (時 : 分)</label>
          <div className="flex gap-2">
            <select
              value={formData.birthHour}
              onChange={(e) => setFormData({ ...formData, birthHour: parseInt(e.target.value, 10) })}
              className="flex-1 px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')} 時
                </option>
              ))}
            </select>
            <select
              value={formData.birthMinute}
              onChange={(e) => setFormData({ ...formData, birthMinute: parseInt(e.target.value, 10) })}
              className="flex-1 px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
            >
              {Array.from({ length: 60 }).map((_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')} 分
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-sm">
        {/* Timezone & Location */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">出生地點 / 經度 (真太陽時校準)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.birthPlace}
              onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-xs"
              placeholder="出生城市 (台北市)"
            />
            <input
              type="number"
              step="0.1"
              value={formData.longitude ?? 121.5}
              onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
              className="w-20 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-amber-300 text-xs font-mono"
              title="經度"
            />
          </div>
        </div>

        {/* Zi Hour Rule */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">子時換日規則 (Zi Hour Rule)</label>
          <select
            value={formData.ziHourRule || 'ziEarly'}
            onChange={(e) => setFormData({ ...formData, ziHourRule: e.target.value as any })}
            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
          >
            <option value="ziEarly">早子時換日 (23:00~23:59 算翌日，預設正統)</option>
            <option value="ziLate">夜子時不換日 (23:00~23:59 算當日晚子)</option>
          </select>
        </div>

        {/* Action Button */}
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xs transition-all"
          >
            排盤計算 (純確定性引擎)
          </button>
        </div>
      </div>
    </form>
  );
};
