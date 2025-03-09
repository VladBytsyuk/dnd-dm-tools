export const TEXTS = {
    settingsLayout: "Стиль статблока",
    settingsLayoutDescription: "Внешний вид и разметка статблока",
    settingsLayout5e: "D&D 5 редакции",
    settingsLayoutTtg: "TTG Club",
    noticeClipboardSuccess: " - успешно скопировано.",
    ribbonActionBestiaryTitle: "Бестиарий",
    ribbonActionInitiativeTrackerTitle: "Трекер инициативы",
    sidePanelBestiaryTitle: "Бестиарий",
    sidePanelInitiativeTrackerTitle: "Трекер инициативы",
    bestiarySearchPlaceholder: "Поиск по имени в бестиарии",
    sidePanelBestiarySearchClear: "Убрать статблок",
    addStatblockModalTwoColumns: "2 столбца",
    addStatblockModalSubmit: "Добавить",
    layoutSource: "Источник",
    layoutArmorClass: "Класс доспеха",
    layoutHits: "Хиты",
    layoutSpeed: "Скорость",
    layoutFt: "фт",
    layoutStr: "СИЛ",
    layoutDex: "ЛОВ",
    layoutCon: "ТЕЛ",
    layoutInt: "ИНТ",
    layoutWis: "МУД",
    layoutCha: "ХАР",
    layoutSaves: "Спасброски",
    layoutSkills: "Навыки",
    layoutDamageVulnerabilities: "Уязвимость к урону",
    layoutDamageResistances: "Сопротивление к урону",
    layoutDamageImmunities: "Иммунитет к урону",
    layoutConditionImmunities: "Иммунитет к состоянию",
    layoutPassivePerception: "пассивная внимательность",
    layoutSenses: "Чувства",
    layoutLanguages: "Языки",
    layoutChallengeRating: "Опасность",
    layoutActions: "Действия",
    layoutBonusActions: "Бонусные действия",
    layoutReactions: "Реакции",
    layoutLegendaryActions: "Легендарные действия",
    layoutLair: "Логово",
    layoutLairActions: "Действия логова",
    layoutRegionalEffects: "Региональные эффекты",
    commandAddStatblock: "Добавить статблок",
    commandAddWideStatblock: "Добавить широкий статблок",
    initiativeTrackerHintCopy: "Копировать",
    initiativeTrackerHintPaste: "Вставить",
    initiativeTrackerHintNext: "Следующий ход",
    initiativeTrackerHintStop: "Остановить",
    initiativeTrackerHintRoll: "Бросить инициативу",
    initiativeTrackerHintSort: "Сортировать по инициативе",
    initiativeTrackerHintClear: "Убрать",
    initiativeTrackerHintAdd: "Добавить",
}

export const randomSpeciality = (): string | undefined => {
    const index = Math.random() * CREATURE_SPECIALITIES.length - 1;
    return CREATURE_SPECIALITIES.at(index);
};

export const CREATURE_SPECIALITIES = [
    "Шрам", "Родинка", "Татуировка", "Хромой", "Горбатый", "Веснушки", "Бородавка", "Косматый", 
    "Лысый", "Косоглазый", "Кольцо", "Пирсинг", "Шрапнель", "Рубец", "Ожог", "Заика", "Хриплый", 
    "Звонкий", "Косой", "Кривой", "Рыжий", "Пепельный", "Алый", "Изумрудный", "Багровый", "Сиплый", 
    "Шёпот", "Хохотун", "Молчун", "Картавый", "Шаткий", "Дрожащий", "Морщинистый", "Гладкий", 
    "Пучеглазый", "Слепой", "Глухой", "Хихикающий", "Сопящий", "Чихун", "Зевун", "Хмурый", 
    "Улыбчивый", "Бровнастый", "Усатый", "Бородатый", "Кудрявый", "Лохматый", "Лощёный", "Потрёпанный", 
    "Латаный", "Выцветший", "Грязный", "Чистюля", "Вонючий", "Парфюмерный", "Пятнистый", "Полосатый", 
    "Клетчатый", "Рваный", "Златоустый", "Серебряный", "Бронзовый", "Медный", "Ржавый", "Зеркальный", 
    "Матовый", "Блестящий", "Тусклый", "Радужный", "Прозрачный", "Мутный", "Колючий", "Мягкий", 
    "Шершавый", "Горячий", "Холодный", "Влажный", "Сухой", "Липкий", "Скользкий", "Пушистый", 
    "Чешуйчатый", "Пернатый", "Рогатый", "Клыкастый", "Когтистый", "Хвостатый", "Плавниковый", 
    "Крылатый", "Жаберный", "Ядовитый", "Огненный", "Ледяной", "Электрический", "Каменный", 
    "Деревянный", "Стеклянный", "Костяной", "Железный", "Золотистый", "Серебристый", "Бирюзовый", 
    "Пурпурный", "Багряный", "Опаловый", "Сапфировый", "Рубиновый", "Изумрудный", "Аметистовый", 
    "Топазовый", "Кровавый", "Мраморный", "Гранитный", "Песчаный", "Глиняный", "Соляной", 
    "Металлический", "Шёлковый", "Бархатный", "Кожаный", "Меховой", "Шерстяной", "Хлопковый", 
    "Льняной", "Плюшевый", "Резиновый", "Пластиковый", "Фарфоровый", "Факельный", "Флагман", 
    "Якорный", "Парусиновый", "Канатный", "Цепной", "Колючепроводный", "Свистящий", "Гремящий", 
    "Звенящий", "Скрипучий", "Шуршащий", "Булькающий", "Жужжащий", "Визжащий", "Рокочущий", 
    "Шипящий", "Воющий", "Стонающий", "Кричащий", "Молчаливый", "Поющий", "Свистящий", "Каркающий", 
    "Кукарекающий", "Мурлыкающий", "Рычащий", "Топающий", "Шаркающий", "Цокающий", "Хлопающий", 
    "Щелкающий", "Жевательный", "Сосущий", "Кусачий", "Лижущий", "Нюхающий", "Чихающий", "Кашляющий", 
    "Плюющий", "Пищащий", "Трещащий", "Грохочущий", "Шепчущий", "Бормочущий", "Ворчащий", "Кривляка", 
    "Прыгун", "Бегун", "Пловец", "Летун", "Ползун", "Крадущийся", "Скалолаз", "Ныряльщик", "Прыткий", 
    "Медлительный", "Резвый", "Неуклюжий", "Грациозный", "Суетливый", "Спокойный", "Порывистый", 
    "Уравновешенный", "Взрывной", "Флегматичный", "Меланхоличный", "Сангвиник", "Холерик", 
    "Оптимист", "Пессимист", "Реалист", "Мечтатель", "Скептик", "Энтузиаст", "Циник", "Романтик", 
    "Прагматик", "Идеалист", "Авантюрист", "Консерватор", "Новатор", "Традиционалист", "Бунтарь", 
    "Лоялист", "Отшельник", "Общительный", "Замкнутый", "Открытый", "Скрытный", "Доверчивый", 
    "Подозрительный", "Великодушный", "Жадный", "Щедрый", "Скупой", "Добрый", "Злой", "Нейтральный", 
    "Весёлый", "Грустный", "Серьёзный", "Шутник", "Самоуверенный", "Скромный", "Наглый", "Вежливый", 
    "Грубиян", "Тактичный", "Бестактный", "Обаятельный", "Противный", "Приятный", "Отталкивающий", 
    "Манерный", "Раскованный", "Стеснительный", "Развязный", "Аккуратный", "Неряха", "Чистоплотный", 
    "Грязнуля", "Пунктуальный", "Несобранный", "Организованный", "Хаотичный", "Ответственный", 
    "Безответственный", "Трудолюбивый", "Ленивый", "Энергичный", "Апатичный", "Страстный", 
    "Равнодушный", "Любознательный", "Безразличный", "Упрямый", "Податливый", "Настойчивый", 
    "Мягкотелый", "Решительный", "Нерешительный", "Смелый", "Трусливый", "Отважный", "Осторожный", 
    "Безрассудный", "Расчётливый", "Импульсивный", "Хладнокровный", "Вспыльчивый", "Сдержанный", 
    "Эмоциональный", "Бесчувственный", "Сочувствующий", "Равнодушный", "Милосердный", "Жестокий", 
    "Сострадательный", "Безжалостный", "Великодушный", "Мстительный", "Прощающий", "Злопамятный", 
    "Дружелюбный", "Враждебный", "Миролюбивый", "Агрессивный", "Дипломатичный", "Конфликтный", 
    "Уступчивый", "Непреклонный", "Компромиссный", "Упёртый", "Гибкий", "Жёсткий", "Толерантный", 
    "Нетерпимый", "Терпеливый", "Нетерпеливый", "Внимательный", "Рассеянный", "Наблюдательный", 
    "Небрежный", "Старательный", "Халтурщик", "Перфекционист", "Практичный", "Непрактичный", 
    "Рациональный", "Иррациональный", "Логичный", "Абсурдный", "Умный", "Глупый", "Мудрый", 
    "Наивный", "Опытный", "Неопытный", "Знающий", "Невежда", "Эрудит", "Неуч", "Талантливый", 
    "Бездарный", "Гениальный", "Посредственный", "Одарённый", "Обычный", "Уникальный", "Редкий", 
    "Распространённый", "Исключительный", "Типичный", "Странный", "Ординарный", "Эксцентричный", 
    "Консервативный", "Прогрессивный", "Архаичный", "Современный", "Футуристичный", "Винтажный", 
    "Модный", "Устаревший", "Актуальный", "Неактуальный", "Популярный", "Неизвестный", "Знаменитый", 
    "Безвестный", "Легендарный", "Мифический", "Реальный", "Вымышленный", "Документальный", 
    "Фантастический", "Реалистичный", "Сюрреалистичный", "Абстрактный", "Конкретный", "Общий", 
    "Частный", "Глобальный", "Локальный", "Внутренний", "Внешний", "Глубинный", "Поверхностный", 
    "Тонкий", "Грубый", "Нежный", "Жёсткий", "Мягкий", "Твёрдый", "Жидкий", "Газообразный", 
    "Кристальный", "Аморфный", "Пористый", "Плотный", "Пушистый", "Колючий", "Гладкий", "Шершавый", 
    "Скользкий", "Липкий", "Сухой", "Влажный", "Мокрый", "Пыльный", "Чистый", "Грязный", "Свежий", 
    "Затхлый", "Ароматный", "Вонючий", "Благоухающий", "Зловонный", "Пахучий", "Без запаха", 
    "Пряный", "Сладкий", "Кислый", "Горький", "Солёный", "Острый", "Пресный", "Ядрёный", "Нежный", 
    "Насыщенный", "Светлый", "Тёмный", "Яркий", "Тусклый", "Блёклый", "Сияющий", "Мерцающий", 
    "Слепящий", "Приглушённый", "Прозрачный", "Мутный", "Отражающий", "Поглощающий", "Горячий", 
    "Холодный", "Тёплый", "Прохладный", "Обжигающий", "Ледяной", "Пламенный", "Морозный", "Жгучий", 
    "Палящий", "Свежий", "Знойный", "Влажный", "Суховейный", "Душный", "Ветреный", "Штилевой", 
    "Ураганный", "Тихий", "Громкий", "Звучный", "Беззвучный", "Мелодичный", "Диссонансный", 
    "Гармоничный", "Ритмичный", "Аритмичный", "Быстрый", "Медленный", "Скоростной", "Неторопливый", 
    "Импульсный", "Постоянный", "Переменчивый", "Стабильный", "Неустойчивый", "Надёжный", "Ненадёжный", 
    "Долговечный", "Хрупкий", "Прочный", "Недолгий", "Вечный", "Временный", "Бесконечный", 
    "Ограниченный", "Безграничный", "Огромный", "Крошечный", "Гигантский", "Карликовый", "Широкий", 
    "Узкий", "Высокий", "Низкий", "Длинный", "Короткий", "Глубокий", "Мелкий", "Плоский", 
    "Объёмный", "Прямой", "Кривой", "Вертикальный", "Горизонтальный", "Наклонный", "Крутой", 
    "Пологий", "Острый", "Тупой", "Заострённый", "Скруглённый", "Угловатый", "Гибкий", "Жёсткий", 
    "Эластичный", "Пластичный", "Твёрдый", "Мягкий", "Жидкий", "Вязкий", "Текучий", "Зернистый", 
    "Порошкообразный", "Кристаллический", "Аморфный", "Пористый", "Плотный", "Рыхлый", "Комковатый", 
    "Однородный", "Неоднородный", "Слоистый", "Монолитный", "Разрозненный", "Цельный", "Дроблёный", 
    "Целостный", "Частичный", "Полный", "Пустой", "Наполненный", "Опустошённый", "Богатый", 
    "Бедный", "Роскошный", "Скромный", "Дорогой", "Дешёвый", "Ценный", "Бесценный", "Обыденный", 
    "Эксклюзивный", "Массовый", "Уникальный", "Тиражный", "Редкий", "Частый", "Постоянный", 
    "Временный", "Вечный", "Мимолётный", "Кратковременный", "Долгий", "Краткий", "Бесконечный", 
    "Конечный", "Беспрерывный", "Прерывистый", "Ритмичный", "Хаотичный", "Упорядоченный", 
    "Дезорганизованный", "Структурированный", "Бессистемный", "Планомерный", "Спонтанный", 
    "Продуманный", "Импровизированный", "Рассчитанный", "Случайный", "Преднамеренный", "Стихийный", 
    "Контролируемый", "Неуправляемый", "Управляемый", "Автономный", "Зависимый", "Независимый", 
    "Свободный", "Ограниченный", "Открытый", "Закрытый", "Доступный", "Недоступный", "Понятный", 
    "Загадочный", "Ясный", "Туманный", "Прозрачный", "Мутный", "Однозначный", "Двусмысленный", 
    "Прямолинейный", "Хитроумный", "Наивный", "Искушённый", "Невинный", "Прожжённый", "Честный", 
    "Лживый", "Правдивый", "Лжец", "Откровенный", "Скрытный", "Искренний", "Лицемерный", 
    "Двуличный", "Прямой", "Косвенный", "Тактичный", "Бестактный", "Дипломатичный", "Грубый", 
    "Вежливый", "Хамоватый", "Учтивый", "Деликатный", "Резкий", "Мягкий", "Жёсткий", "Толерантный", 
    "Нетерпимый", "Снисходительный", "Требовательный", "Либеральный", "Авторитарный", "Демократичный", 
    "Тоталитарный", "Анархичный", "Справедливый", "Несправедливый", "Предвзятый", "Беспристрастный", 
    "Пристрастный", "Нейтральный", "Субъективный", "Объективный", "Личный", "Общественный", 
    "Частный", "Публичный", "Секретный", "Открытый", "Сокрытый", "Явный", "Скрытый", "Очевидный", 
    "Неявный", "Понятный", "Непонятный"
]