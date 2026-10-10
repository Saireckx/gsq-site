import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, User, FileText } from 'lucide-react';
import { SELLER_REQUISITES } from '../lib/constants';

export const Privacy: React.FC = () => {
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-10 pb-8 border-b border-white/[0.08]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300 font-semibold mb-3">
          <Lock className="w-3.5 h-3.5 text-neutral-300" />
          <span>Защита данных</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Политика конфиденциальности
        </h1>
        <p className="mt-3 text-sm sm:text-base text-neutral-400 leading-relaxed">
          Порядок обработки и защиты персональной информации пользователей игрового проекта «GSQ» в соответствии с Федеральным законом № 152-ФЗ.
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          Действует с 10 октября 2026 года
        </p>
      </div>

      {/* Operator Summary Box */}
      <div className="mb-12 p-6 rounded-2xl bg-neutral-900/80 border border-white/10 shadow-lg space-y-4">
        <div className="flex items-center gap-2.5 text-sm font-bold text-white uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Оператор персональных данных</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs sm:text-sm">
          <div>
            <span className="text-neutral-500 block">Оператор (самозанятый):</span>
            <span className="font-semibold text-white">{SELLER_REQUISITES.name}</span>
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
          <div>
            <span className="text-neutral-500 block">Веб-сайт:</span>
            <span className="font-mono text-neutral-300">gsqshop.shop</span>
          </div>
        </div>
      </div>

      {/* Policy Content */}
      <div className="space-y-10 text-sm text-neutral-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">1. Общие положения</h2>
          <p>
            1.1. Настоящая Политика конфиденциальности определяет порядок сбора, хранения, обработки и защиты информации о физических лицах (далее — «Пользователи»), пользующихся услугами сайта <strong>gsqshop.shop</strong> и игрового сервера Minecraft «GSQ».
          </p>
          <p>
            1.2. Использование сервисов Сайта означает безоговорочное согласие Пользователя с настоящей Политикой и указанными в ней условиями обработки его информации.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">2. Состав собираемой информации</h2>
          <p>
            2.1. В рамках функционирования Сайта и оформления заказов обрабатываются следующие данные:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Игровой никнейм в игре Minecraft (для автоматической выдачи привилегий и виртуальных предметов на Сервере);</li>
            <li>Адрес электронной почты (в случае добровольного обращения в службу поддержки или указания при оплате);</li>
            <li>Технические данные: IP-адрес, файлы cookie, тип браузера, время посещения;</li>
            <li>Данные о совершенных транзакциях: дата, время, сумма платежа, номер заказа, статус оплаты.</li>
          </ul>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 mt-2">
            <strong>Важно:</strong> Администрация проекта «GSQ» <strong>не собирает, не обрабатывает и не хранит</strong> данные банковских карт Пользователей. Все платежные операции осуществляются на защищенной платежной странице сервиса <strong>ЮKassa</strong> (ООО НКО «ЮМани») по международному стандарту безопасности PCI DSS.
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">3. Цели обработки информации</h2>
          <p>3.1. Персональные данные Пользователя обрабатываются исключительно в следующих целях:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Исполнение обязательств по <Link to="/offer" className="text-white underline hover:text-amber-300">Договору публичной оферты</Link> (активация игровых услуг на Сервере);</li>
            <li>Предоставление технической поддержки и разрешение спорных ситуаций по заказам;</li>
            <li>Предотвращение мошеннических действий и обеспечение безопасности игрового процесса;</li>
            <li>Выполнение требований законодательства РФ о бухгалтерской и налоговой отчетности (в части фиксации чеков самозанятого).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">4. Порядок и условия обработки</h2>
          <p>
            4.1. Обработка персональных данных осуществляется с соблюдением принципов и правил, предусмотренных Федеральным законом № 152-ФЗ «О персональных данных».
          </p>
          <p>
            4.2. Передача данных третьим лицам не осуществляется, за исключением случаев, прямо предусмотренных законодательством РФ, а также передачи данных платежной системе ЮKassa для проведения онлайн-оплаты.
          </p>
          <p>
            4.3. Данные хранятся в течение срока, необходимого для достижения целей обработки, либо до момента отзыва согласия Пользователем.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">5. Права Пользователя</h2>
          <p>
            5.1. Пользователь имеет право на получение информации, касающейся обработки его персональных данных, а также на отзыв согласия на обработку данных путем направления запроса на электронную почту <a href={`mailto:${SELLER_REQUISITES.email}`} className="text-white underline">{SELLER_REQUISITES.email}</a>.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-white/[0.08]">
          <h2 className="text-xl font-bold text-white">6. Контакты оператора</h2>
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-2 text-xs sm:text-sm">
            <p><strong>Самозанятый:</strong> {SELLER_REQUISITES.name}</p>
            <p><strong>ИНН:</strong> <span className="font-mono font-bold text-amber-300">{SELLER_REQUISITES.inn}</span></p>
            <p><strong>E-mail:</strong> <a href={`mailto:${SELLER_REQUISITES.email}`} className="text-white underline">{SELLER_REQUISITES.email}</a></p>
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
          to="/offer"
          className="text-xs text-neutral-400 hover:text-white underline underline-offset-2 transition-colors"
        >
          Договор оферты →
        </Link>
      </div>
    </div>
  );
};
