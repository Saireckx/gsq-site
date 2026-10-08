import React, { useState } from 'react';
import { useStore, ProductItem } from '../../context/StoreContext';
import { ProductIcon } from '../../components/admin/ProductIcon';
import { 
  FolderPlus, 
  Tag, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  HelpCircle, 
  Terminal, 
  Sparkles,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

export const ProductsTab: React.FC = () => {
  const { products, updateProduct, addProduct, deleteProduct } = useStore();

  // Currently editing product (defaults to first product or sub-plus)
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || 'sub');
  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Editable form state for active product
  const [formData, setFormData] = useState<ProductItem>(selectedProduct);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Sync form when selected product changes
  React.useEffect(() => {
    if (selectedProduct) {
      setFormData(selectedProduct);
      setIsCreatingNew(false);
    }
  }, [selectedProductId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingNew) {
      const created = addProduct(formData);
      setSelectedProductId(created.id);
      setIsCreatingNew(false);
    } else {
      updateProduct(formData.id, formData);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2200);
  };

  const handleStartNewProduct = () => {
    const newTemplate: ProductItem = {
      id: 'temp-' + Date.now(),
      numericId: Math.floor(1060500 + Math.random() * 900),
      name: 'Новый товар',
      price: 199,
      oldPrice: 249,
      period: 'навсегда',
      type: 'Привилегия',
      command: 'lp user {user} parent add custom_role',
      description: 'Описание нового товара',
      category: 'Подписки',
      iconColor: 'magenta',
      hidden: false,
      offlineAllowed: true,
      features: ['Преимущество 1', 'Преимущество 2'],
    };
    setFormData(newTemplate);
    setIsCreatingNew(true);
  };

  const productTypes: ProductItem['type'][] = ['Предмет', 'Привилегия', 'Валюта', 'Рулетка', 'Другое'];

  return (
    <div className="space-y-8">
      {/* Top Header Toolbar matching Screenshot 2 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>GSQ — товары</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              Всего: {products.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Редактируйте цены и параметры товаров. Изменения моментально отображаются на сайте!
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleStartNewProduct}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Добавить товар</span>
          </button>
        </div>
      </div>

      {/* Product Editor Card matching Screenshot 2 & 3 */}
      {formData && (
        <form onSubmit={handleSave} className="rounded-2xl bg-[#131a29] border border-slate-800 p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isCreatingNew ? 'Создание нового товара' : `Редактирование: ${formData.name}`}</span>
            </span>

            {saveSuccess && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold animate-in fade-in">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Сохранено на сайте!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Preview box with product icon & price */}
            <div className="lg:col-span-4 rounded-xl bg-[#0e1422] border border-slate-800 p-5 flex flex-col justify-between items-center text-center">
              <div className="w-full">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-center font-bold text-slate-100 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-amber-400 focus:outline-none py-1 text-base transition-colors"
                  placeholder="Название товара"
                  required
                />
              </div>

              {/* Product Icon Preview */}
              <div className="my-6 flex flex-col items-center gap-2">
                <ProductIcon productId={formData.id} name={formData.name} type={formData.type} category={formData.category} size="xl" />
                <span className="text-[11px] text-slate-400 font-medium px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 mt-1">
                  {formData.category || formData.type}
                </span>
              </div>

              {/* Price inputs: Forever and Monthly */}
              <div className="w-full pt-4 border-t border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Цена навсегда:</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <input
                      type="number"
                      min="1"
                      max="100000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                      className="w-20 px-2 py-1 rounded-lg bg-[#141b2a] border border-slate-700 text-white text-center font-bold focus:border-amber-400 focus:outline-none text-xs"
                      required
                    />
                    <span>₽</span>
                  </div>
                </div>

                {(formData.id === 'sub' || formData.id === 'sub-plus' || formData.monthlyPrice !== undefined) && (
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Цена на месяц:</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <input
                        type="number"
                        min="1"
                        max="100000"
                        value={formData.monthlyPrice || (formData.id === 'sub' ? 139 : 289)}
                        onChange={(e) => setFormData({ ...formData, monthlyPrice: Number(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 rounded-lg bg-[#141b2a] border border-slate-700 text-white text-center font-bold focus:border-amber-400 focus:outline-none text-xs"
                      />
                      <span>₽</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Type, Command, Description matching Screenshot 2 & 3 */}
            <div className="lg:col-span-8 space-y-5">
              {/* Product Type Chips matching Screenshot 2 */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Тип товара
                </label>
                <div className="flex flex-wrap gap-2">
                  {productTypes.map((type) => {
                    const isSelected = formData.type === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-black shadow-sm font-bold'
                            : 'bg-[#0e1422] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Command input matching Screenshot 2 */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-400" />
                  <span>Команды для выдачи</span>
                  <span className="cursor-help text-slate-500" title="Команда, выполняемая на сервере после оплаты. Доступны плейсхолдеры: {user}, {amount}">
                    <HelpCircle className="w-3 h-3" />
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.command}
                  onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                  placeholder="give {user} minecraft:diamond_sword {amount}"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1422] border border-slate-800 text-slate-200 text-xs font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Description textarea matching Screenshot 2 */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Описание товара
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Опишите преимущества товара..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1422] border border-slate-800 text-slate-200 text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Additional Settings Row matching Screenshot 3 */}
          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Дополнительные настройки
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Цена без скидки (старая)
                  </label>
                  <input
                    type="number"
                    value={formData.oldPrice || ''}
                    onChange={(e) => setFormData({ ...formData, oldPrice: Number(e.target.value) || undefined })}
                    placeholder="299"
                    className="w-full px-3 py-2 rounded-lg bg-[#0e1422] border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Категория
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Подписки"
                    className="w-full px-3 py-2 rounded-lg bg-[#0e1422] border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Toggles matching Screenshot 3 */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hidden}
                    onChange={(e) => setFormData({ ...formData, hidden: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0"
                  />
                  <span className="text-xs text-slate-300">Скрыть товар в магазине</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.offlineAllowed}
                    onChange={(e) => setFormData({ ...formData, offlineAllowed: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0"
                  />
                  <span className="text-xs text-slate-300">Оффлайн покупка разрешена</span>
                </label>
              </div>
            </div>

            {/* Servers and Save Button */}
            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Серверы
                </h4>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0e1422] border border-slate-800 text-xs text-slate-200 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>GSQ</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-glow-sm flex items-center gap-2 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Сохранить товар на сайте</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Grid of all Products matching Screenshot 2 */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
          Список товаров магазина ({products.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const isSelected = selectedProductId === product.id && !isCreatingNew;

            return (
              <div
                key={product.id}
                onClick={() => setSelectedProductId(product.id)}
                className={`relative rounded-2xl bg-[#131a29] p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer group ${
                  isSelected
                    ? 'border-2 border-amber-400 shadow-glow-sm'
                    : 'border border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Card Header: ID and action buttons matching Screenshot 2 */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-3">
                  <span className="text-[11px] font-mono text-slate-500">
                    ID: {product.numericId}
                  </span>

                  <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProductId(product.id);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Редактировать"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Удалить товар «${product.name}»?`)) {
                          deleteProduct(product.id);
                        }
                      }}
                      className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-xs font-bold text-slate-200 mb-4 truncate flex items-center gap-1.5">
                  <span>{product.name}</span>
                </h4>

                {/* Product Icon */}
                <div className="my-2 flex justify-center py-2">
                  <ProductIcon productId={product.id} name={product.name} type={product.type} category={product.category} size="lg" />
                </div>

                {/* Footer: Price tag & quick edit */}
                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <div className="font-mono font-bold text-white flex flex-col">
                    <span>{product.price} ₽ <span className="text-slate-500 font-normal">/ {product.period}</span></span>
                    {product.monthlyPrice && (
                      <span className="text-[10px] text-amber-400 font-normal">
                        или {product.monthlyPrice} ₽ / 1 мес.
                      </span>
                    )}
                  </div>

                  {product.hidden ? (
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <EyeOff className="w-3 h-3" />
                      Скрыт
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      В магазине
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
