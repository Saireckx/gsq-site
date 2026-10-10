import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, Mail, User, CreditCard, Clock, RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SELLER_REQUISITES } from '../lib/constants';

export const Offer: React.FC = () => {
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-10 pb-8 border-b border-white/[0.08]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300 font-semibold mb-3">
          <FileText className="w-3.5 h-3.5 text-neutral-300" />
          <span>Юридический документ</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Договор публичной оферты
        </h1>
        <p className="mt-3 text-sm sm:text-base text-neutral-400 leading-relaxed">
          Публичное предложение о предоставлении неисключительных прав и цифровых услуг на игровом сервере Minecraft «GSQ».
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          Редакция действует с 10 октября 2026 года
        </p>
      </div>

      {/* Seller Summary Box */}
      <div className="mb-12 p-6 rounded-2xl bg-neutral-900/80 border border-white/10 shadow-lg space-y-4">
        <div className="flex items-center gap-2.5 text-sm font-bold text-white uppercase tracking-wider">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Сведения об Исполнителе (Продавце)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs sm:text-sm">
          <div>
            <span className="text-neutral-500 block">ФИО Исполнителя:</span>
            <span className="font-semibold text-white">{SELLER_REQUISITES.name}</span>
          </div>
          <div>
            <span className="text-neutral-500 block">Правовой статус:</span>
            <span className="font-semibold text-white">{SELLER_REQUISITES.status}</span>
          </div>
          <div>
            <span className="text-neutral-500 block">ИНН:</span>
            <span className="font-mono font-bold text-amber-300">{SELLER_REQUISITES.inn}</span>
          </div>
          <div>
            <span className="text-neutral-500 block">Контактный E-mail:</span>
            <a
              href={`mailto:${SELLER_REQUISITES.email}`}
              className="font-medium text-neutral-200 hover:text-white underline underline-offset-2"
            >
              {SELLER_REQUISITES.email}
            </a>
          </div>
        </div>
      </div>

      {/* Offer Content */}
      <div className="space-y-10 text-sm text-neutral-300 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>1. Общие положения</span>
          </h2>
          <p>
            1.1. Настоящий документ является официальным предложением (публичной офертой) плательщика налога на профессиональный доход (самозанятого) <strong>{SELLER_REQUISITES.name}</strong> (ИНН <strong>{SELLER_REQUISITES.inn}</strong>), именуемого в дальнейшем <strong>«Исполнитель»</strong>, и содержит все существенные условия предоставления неисключительных прав на использование дополнительного игрового функционала и цифровых услуг на многопользовательском сервере Minecraft «GSQ» (далее — <strong>«Сервер»</strong>).
          </p>
          <p>
            1.2. В соответствии с пунктом 2 статьи 437 Гражданского кодекса Российской Федерации (ГК РФ) данный документ является публичной офертой. Моментом полного и безоговорочного принятия (акцепта) Пользователем условий настоящей Оферты в соответствии с пунктом 3 статьи 438 ГК РФ признается факт осуществления оплаты Пользователем выбранной услуги/товара на сайте <strong>gsqshop.shop</strong>.
          </p>
          <p>
            1.3. Совершая оплату, Пользователь подтверждает, что ознакомлен и полностью согласен со всеми положениями настоящей Оферты, а также с <Link to="/rules" className="text-white underline underline-offset-2 hover:text-amber-300">Правилами сервера GSQ</Link> и <Link to="/privacy" className="text-white underline underline-offset-2 hover:text-amber-300">Политикой конфиденциальности</Link>.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>2. Термины и определения</span>
          </h2>
          <ul className="list-disc list-inside space-y-2 text-neutral-300 pl-2">
            <li>
              <strong>Сайт</strong> — официальный интернет-ресурс проекта «GSQ», размещенный в сети Интернет по сетевому адресу: <span className="text-white font-mono">gsqshop.shop</span>.
            </li>
            <li>
              <strong>Игровой сервер (Сервер)</strong> — игровой комплекс программного обеспечения Minecraft «GSQ», доступный для подключения игроков по сетевому адресу <span className="text-white font-mono">play.mygsq.fun</span>.
            </li>
            <li>
              <strong>Пользователь (Покупатель)</strong> — дееспособное физическое лицо, осуществившее акцепт настоящей Оферты путем оформления заказа и оплаты на Сайте.
            </li>
            <li>
              <strong>Цифровой товар / Услуга</strong> — неисключительное право использования дополнительного функционала на Сервере (включая, но не ограничиваясь: подписки «SUB», «SUB+», кейсы аксессуаров «Коробка со шляпой», разбан, размут, внутриигровые команды). Виртуальные ценности предназначены исключительно для использования внутри Сервера и не имеют реальной денежной стоимости за его пределами.
            </li>
            <li>
              <strong>Платежный агрегатор</strong> — сервис приема электронных платежей ЮKassa (ООО НКО «ЮМани»), обеспечивающий безопасный прием денежных средств от Пользователей.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>3. Предмет Оферты</span>
          </h2>
          <p>
            3.1. Исполнитель обязуется предоставить Пользователю неисключительные права доступа к расширенным игровым возможностям и цифровым услугам на Сервере Minecraft «GSQ» в объеме выбранного Пользователем тарифа, а Пользователь обязуется оплатить эти услуги в порядке и на условиях, установленных настоящей Офертой.
          </p>
          <p>
            3.2. Проект «GSQ» не является официальным продуктом Minecraft, не связан с Mojang Studios или Microsoft Corporation и не одобрен ими.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-neutral-300" />
            <span>4. Порядок оформления заказа и оплаты</span>
          </h2>
          <p>
            4.1. Для оформления заказа Пользователь выбирает интересующую услугу на странице <Link to="/store" className="text-white underline underline-offset-2 hover:text-amber-300">Магазина</Link>, указывает свой точный игровой никнейм на Сервере, при наличии — промокод на скидку, и нажимает кнопку перехода к оплате.
          </p>
          <p>
            4.2. Оплата осуществляется в российских рублях (RUB) с использованием платежного сервиса <strong>ЮKassa</strong> поддерживаемыми способами: банковские карты (МИР, Visa, Mastercard), СБП (Система быстрых платежей), SberPay и иные методы, предоставляемые сервисом ЮKassa.
          </p>
          <p>
            4.3. Обязательство Пользователя по оплате считается исполненным с момента поступления подтверждения успешного платежа от платежной системы ЮKassa на сервер Исполнителя.
          </p>
          <p>
            4.4. Все комиссии, взимаемые банком или платежной системой при переводе денежных средств, регулируются тарифами соответствующего банка или оператора.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-neutral-300" />
            <span>5. Сроки и порядок оказания услуг (Доставка)</span>
          </h2>
          <p>
            5.1. Услуги и цифровые товары предоставляются в электронном виде и активируются в <strong>автоматическом режиме</strong> на игровом сервере Minecraft «GSQ» по никнейму, указанному Пользователем при оформлении заказа.
          </p>
          <p>
            5.2. Стандартный срок автоматической активации составляет от <strong>1 до 5 минут</strong> после успешного прохождения платежа в системе ЮKassa.
          </p>
          <p>
            5.3. В исключительных случаях (плановые технические работы на Сервере, перезагрузка оборудования, задержки API) срок активации услуги может составлять до <strong>24 часов</strong>.
          </p>
          <p>
            5.4. Если по истечении 24 часов оплаченная услуга не была получена, Пользователь должен обратиться в службу поддержки по адресу <a href={`mailto:${SELLER_REQUISITES.email}`} className="text-white underline underline-offset-2">{SELLER_REQUISITES.email}</a> или в официальном Discord-сообществе с указанием номера заказа и игрового никнейма.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-neutral-300" />
            <span>6. Условия возврата денежных средств</span>
          </h2>
          <p>
            6.1. В соответствии со статьей 26.1 Закона РФ «О защите прав потребителей» и положениями Гражданского кодекса РФ о цифровом контенте, цифровые услуги и неисключительные права надлежащего качества, фактически предоставленные и активированные на игровом сервере, обмену и возврату не подлежат в силу немедленного начала их потребления в игровом процессе.
          </p>
          <p>
            6.2. Возврат денежных средств возможен в следующих случаях:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Оплата была списана, но услуга не была активирована по вине Исполнителя, и техническая ошибка не может быть устранена в течение 3 (трех) рабочих дней с момента обращения Пользователя;</li>
            <li>Произошло ошибочное повторное списание средств за один и тот же заказ (двойной платеж).</li>
          </ul>
          <p>
            6.3. Блокировка игрового аккаунта Пользователя администрацией Сервера за нарушение <Link to="/rules" className="text-white underline underline-offset-2 hover:text-amber-300">Правил сервера GSQ</Link> (использование читов, вредоносного ПО, гриферство, деструктивное поведение) не является основанием для возврата денежных средств за ранее приобретенные услуги.
          </p>
          <p>
            6.4. Для оформления возврата денежных средств Пользователь направляет электронное письмо на адрес <a href={`mailto:${SELLER_REQUISITES.email}`} className="text-white underline underline-offset-2">{SELLER_REQUISITES.email}</a> с темой «Заявление на возврат средств». В письме указываются: номер заказа, дата и точное время платежа, игровой никнейм, сумма платежа, скриншот чека из банка/ЮKassa и подробное описание причины возврата.
          </p>
          <p>
            6.5. Срок рассмотрения заявления на возврат составляет не более <strong>10 (десяти) рабочих дней</strong>. Возврат осуществляется на ту же банковскую карту или счет, с которого была произведена исходная оплата через ЮKassa.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>7. Права и обязанности сторон</span>
          </h2>
          <p>
            7.1. <strong>Исполнитель обязуется:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Обеспечить своевременную активацию приобретенных услуг на Сервере;</li>
            <li>Поддерживать работоспособность Сервера за исключением времени проведения технических работ;</li>
            <li>Соблюдать конфиденциальность данных Пользователя.</li>
          </ul>
          <p className="pt-2">
            7.2. <strong>Пользователь обязуется:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Указывать корректный и действующий никнейм при совершении оплаты;</li>
            <li>Строго соблюдать установленные Правила сервера GSQ;</li>
            <li>Не использовать полученные возможности во вред игровому процессу других участников или стабильности работы Сервера.</li>
          </ul>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>8. Срок действия и изменение условий Оферты</span>
          </h2>
          <p>
            8.1. Настоящая Оферта вступает в силу с момента ее публикации на Сайте и действует бессрочно до момента отзыва Исполнителем.
          </p>
          <p>
            8.2. Исполнитель вправе в одностороннем порядке вносить изменения в текст настоящей Оферты. Актуальная действующая редакция всегда размещается в открытом доступе на странице Сайта <span className="text-white font-mono">gsqshop.shop/#/offer</span>.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-3 pt-4 border-t border-white/[0.08]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>9. Реквизиты Исполнителя</span>
          </h2>
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-2 text-xs sm:text-sm">
            <p><strong>Исполнитель:</strong> {SELLER_REQUISITES.name}</p>
            <p><strong>Статус:</strong> {SELLER_REQUISITES.status}</p>
            <p><strong>ИНН:</strong> <span className="font-mono font-bold text-amber-300">{SELLER_REQUISITES.inn}</span></p>
            <p><strong>Электронная почта:</strong> <a href={`mailto:${SELLER_REQUISITES.email}`} className="text-white underline">{SELLER_REQUISITES.email}</a></p>
            <p><strong>Сайт:</strong> <span className="font-mono text-neutral-300">https://gsqshop.shop</span></p>
          </div>
        </section>
      </div>

      {/* Back button */}
      <div className="mt-12 pt-6 border-t border-white/[0.08] flex items-center justify-between">
        <Link
          to="/store"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all shadow-glow-white"
        >
          <span>В магазин</span>
        </Link>
        <Link
          to="/privacy"
          className="text-xs text-neutral-400 hover:text-white underline underline-offset-2 transition-colors"
        >
          Политика конфиденциальности →
        </Link>
      </div>
    </div>
  );
};
