// 栄養学の学習コンテンツ
import { useMemo, useState } from 'react'
import { Award, BookOpen, Brain, ChevronRight, Zap } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import NutritionQuiz from './NutritionQuiz'

// 栄養学の学習画面（記事一覧とクイズ）
export function NutritionEducation({
  isPremium = false,
  onUpgrade = () => {},
  onBack,
  theme = 'light',
}) {
  // クイズ表示の切り替え
  const [showQuiz, setShowQuiz] = useState(false)
  // 選択中の記事ID
  const [selectedArticle, setSelectedArticle] = useState(null)

  // 記事データ（useMemoで固定）
  const articles = useMemo(
    () => [
      {
        id: 1,
        title: 'タンパク質の基礎知識',
        category: 'タンパク質',
        icon: '💪',
        color: 'from-[#FF9500]/10 to-[#FF9500]/5 dark:from-[#FF9500]/20 dark:to-[#FF9500]/10',
        borderColor: 'border-[#FF9500]/20 dark:border-[#FF9500]/30',
        iconBg: 'bg-[#FF9500]/20 dark:bg-[#FF9500]/30',
        iconColor: 'text-[#FF9500] dark:text-[#FF9500]',
        readTime: '5分',
        content: {
          intro:
            'タンパク質は筋肉や臓器、皮膚、髪など体のあらゆる組織を構成する重要な栄養素です。',
          sections: [
            {
              title: 'タンパク質とは',
              text:
                'タンパク質は20種類のアミノ酸が結合してできており、体内で約10万種類のタンパク質として働いています。筋肉、骨、血液、ホルモン、酵素など、体のあらゆる部分を構成する重要な栄養素です。',
            },
            {
              title: '1日に必要な量',
              text:
                '一般的な成人の場合、体重1kgあたり0.8〜1.0g程度が推奨されています。体重60kgの人なら、1日48〜60gが目安です。運動習慣がある方は1.2〜2.0g/kgが推奨されます。',
            },
            {
              title: '良質なタンパク質源',
              points: [
                '動物性：鶏むね肉、鶏ささみ、卵、魚類、牛赤身肉',
                '植物性：大豆製品（豆腐、納豆）、レンズ豆、キヌア',
                'プロテインパウダー：手軽に補給できるサプリメント',
              ],
            },
            {
              title: 'タンパク質不足のサイン',
              points: [
                '筋肉量の低下、疲れやすい',
                '髪の毛や爪が弱くなる',
                '免疫力の低下',
                '傷の治りが遅い',
              ],
            },
          ],
          tips: [
            '朝食でタンパク質を摂ると、1日の代謝が上がります',
            '運動後30分以内の摂取が最も効果的です',
            '動物性と植物性をバランスよく摂りましょう',
          ],
        },
      },
      {
        id: 2,
        title: '炭水化物との上手な付き合い方',
        category: '炭水化物',
        icon: '🍚',
        color: 'from-[#5AC8FA]/10 to-[#5AC8FA]/5 dark:from-[#5AC8FA]/20 dark:to-[#5AC8FA]/10',
        borderColor: 'border-[#5AC8FA]/20 dark:border-[#5AC8FA]/30',
        iconBg: 'bg-[#5AC8FA]/20 dark:bg-[#5AC8FA]/30',
        iconColor: 'text-[#5AC8FA] dark:text-[#5AC8FA]',
        readTime: '6分',
        content: {
          intro:
            '炭水化物は体のエネルギー源として重要ですが、種類や量を選ぶことが健康的な生活の鍵です。',
          sections: [
            {
              title: '炭水化物の役割',
              text:
                '炭水化物は体の主要なエネルギー源です。特に脳は炭水化物からのブドウ糖を主なエネルギー源としており、1日に約120gのブドウ糖を消費します。',
            },
            {
              title: 'GI値とは',
              text:
                'GI値（グリセミック指数）は、食品が血糖値を上げる速度を示す指標です。低GI食品（GI値55以下）は血糖値の急上昇を防ぎ、腹持ちも良いためダイエットに効果的です。',
            },
            {
              title: '良い炭水化物vs悪い炭水化物',
              points: [
                '良い炭水化物：玄米、オートミール、全粒粉パン、さつまいも、キヌア',
                '悪い炭水化物：白米、白パン、菓子パン、ケーキ、清涼飲料水',
                '違いは食物繊維の含有量と血糖値への影響です',
              ],
            },
            {
              title: '1日の適量',
              text:
                '総カロリーの50〜65%が炭水化物から摂取する目安です。2000kcal/日なら250〜325g程度。ダイエット中でも最低100gは必要です。',
            },
          ],
          tips: [
            '白米を玄米や雑穀米に変えるだけで栄養価が大幅アップ',
            '食物繊維と一緒に摂ると血糖値の上昇が緩やかに',
            '夜遅い時間の炭水化物は控えめに',
          ],
        },
      },
      {
        id: 3,
        title: '脂質の真実：敵ではなく味方',
        category: '脂質',
        icon: '🥑',
        color: 'from-[#AF52DE]/10 to-[#AF52DE]/5 dark:from-[#AF52DE]/20 dark:to-[#AF52DE]/10',
        borderColor: 'border-[#AF52DE]/20 dark:border-[#AF52DE]/30',
        iconBg: 'bg-[#AF52DE]/20 dark:bg-[#AF52DE]/30',
        iconColor: 'text-[#AF52DE] dark:text-[#AF52DE]',
        readTime: '5分',
        content: {
          intro: '脂質は太る原因と思われがちですが、実は体に必要不可欠な栄養素です。重要なのは「質」です。',
          sections: [
            {
              title: '脂質の重要な役割',
              text:
                '脂質はエネルギー源（1gあたり9kcal）として、また脂溶性ビタミン（A、D、E、K）の吸収を助け、ホルモンや細胞膜の材料となります。',
            },
            {
              title: '良い脂質vs悪い脂質',
              points: [
                '良い脂質（不飽和脂肪酸）：オリーブオイル、アボカド、ナッツ、青魚（DHA・EPA）',
                '悪い脂質（飽和脂肪酸）：バター、ラード、脂身の多い肉',
                '最悪の脂質（トランス脂肪酸）：マーガリン、ショートニング、加工食品',
              ],
            },
            {
              title: 'オメガ3とオメガ6',
              text:
                'オメガ3（魚、亜麻仁油）とオメガ6（植物油）のバランスは1:4が理想です。現代人はオメガ6が過剰なので、意識的にオメガ3を摂りましょう。',
            },
            {
              title: '1日の適量',
              text:
                '総カロリーの20〜30%が脂質から摂取する目安です。2000kcal/日なら約44〜67g程度。極端な制限は禁物です。',
            },
          ],
          tips: [
            '調理油はオリーブオイルやアボカドオイルがおすすめ',
            '週2〜3回は青魚を食べましょう',
            'ナッツは1日手のひら一杯分が適量',
          ],
        },
      },
      {
        id: 4,
        title: 'ビタミン完全ガイド',
        category: 'ビタミン',
        icon: '🍊',
        color: 'from-[#34C759]/10 to-[#34C759]/5 dark:from-[#00ff41]/20 dark:to-[#00ff41]/10',
        borderColor: 'border-[#34C759]/20 dark:border-[#00ff41]/30',
        iconBg: 'bg-[#34C759]/20 dark:bg-[#00ff41]/30',
        iconColor: 'text-[#34C759] dark:text-[#00ff41]',
        readTime: '7分',
        content: {
          intro: 'ビタミンは微量でも体の機能を正常に保つために必要不可欠な栄養素です。',
          sections: [
            {
              title: '水溶性ビタミン（B群・C）',
              points: [
                'ビタミンB1：エネルギー代謝、神経機能（豚肉、玄米）',
                'ビタミンB2：脂質代謝、皮膚・粘膜の健康（レバー、卵）',
                'ビタミンB6：タンパク質代謝（鶏肉、バナナ）',
                'ビタミンB12：赤血球生成（魚、貝類）',
                'ビタミンC：コラーゲン生成、免疫力（ピーマン、キウイ）',
                '※水溶性なので過剰摂取の心配は少ないが、毎日摂取が必要',
              ],
            },
            {
              title: '脂溶性ビタミン（A・D・E・K）',
              points: [
                'ビタミンA：視力、皮膚の健康（レバー、にんじん）',
                'ビタミンD：カルシウム吸収、骨の健康（魚、日光浴）',
                'ビタミンE：抗酸化作用（ナッツ、アボカド）',
                'ビタミンK：血液凝固（納豆、緑黄色野菜）',
                '※体内に蓄積されるので過剰摂取に注意',
              ],
            },
            {
              title: 'ビタミン不足のサイン',
              points: [
                'ビタミンB群不足：疲れやすい、口内炎',
                'ビタミンC不足：風邪をひきやすい、肌荒れ',
                'ビタミンD不足：骨が弱くなる、免疫力低下',
              ],
            },
          ],
          tips: [
            '野菜は350g/日（両手いっぱい）が目安',
            '緑黄色野菜は油と一緒に調理すると吸収率アップ',
            'サプリメントより食事から摂るのが基本',
          ],
        },
      },
      {
        id: 5,
        title: 'ミネラルの働きと摂取方法',
        category: 'ミネラル',
        icon: '⚡',
        color: 'from-[#FF2D55]/10 to-[#FF2D55]/5 dark:from-[#FF2D55]/20 dark:to-[#FF2D55]/10',
        borderColor: 'border-[#FF2D55]/20 dark:border-[#FF2D55]/30',
        iconBg: 'bg-[#FF2D55]/20 dark:bg-[#FF2D55]/30',
        iconColor: 'text-[#FF2D55] dark:text-[#FF2D55]',
        readTime: '6分',
        content: {
          intro: 'ミネラルは骨や歯の形成、体液の調整、神経・筋肉の機能維持に不可欠です。',
          sections: [
            {
              title: '主要ミネラル',
              points: [
                'カルシウム：骨と歯の形成（牛乳、小魚、小松菜）- 700〜800mg/日',
                'マグネシウム：酵素の活性化（ナッツ、海藻）- 270〜370mg/日',
                'カリウム：血圧調整（バナナ、アボカド）- 2500〜3000mg/日',
                'ナトリウム：体液バランス（食塩）- 6〜7.5g/日未満',
                'リン：骨の形成（肉、魚、乳製品）',
              ],
            },
            {
              title: '微量ミネラル',
              points: [
                '鉄：酸素運搬（レバー、ほうれん草）- 女性10.5mg/日',
                '亜鉛：免疫機能、味覚（牡蠣、赤身肉）- 10〜11mg/日',
                'ヨウ素：甲状腺ホルモン（海藻）- 130μg/日',
                'セレン：抗酸化作用（魚、卵）',
                '銅：鉄の代謝（レバー、ナッツ）',
              ],
            },
            {
              title: 'ミネラル不足のサイン',
              points: [
                '鉄不足：貧血、疲れやすい、めまい',
                'カルシウム不足：骨粗しょう症、イライラ',
                'マグネシウム不足：筋肉のけいれん、不眠',
                '亜鉛不足：味覚障害、免疫力低下',
              ],
            },
            {
              title: '日本人が不足しがちなミネラル',
              text:
                'カルシウム、鉄分（特に女性）、マグネシウムが不足しがちです。一方、ナトリウム（塩分）は過剰摂取の傾向があります。',
            },
          ],
          tips: [
            '鉄分はビタミンCと一緒に摂ると吸収率アップ',
            'カルシウムはビタミンDと一緒に摂取',
            '減塩を心がけ、カリウムで排出を促進',
          ],
        },
      },
      {
        id: 6,
        title: '水分補給の重要性',
        category: '水分',
        icon: '💧',
        color: 'from-[#00C7BE]/10 to-[#00C7BE]/5 dark:from-[#00C7BE]/20 dark:to-[#00C7BE]/10',
        borderColor: 'border-[#00C7BE]/20 dark:border-[#00C7BE]/30',
        iconBg: 'bg-[#00C7BE]/20 dark:bg-[#00C7BE]/30',
        iconColor: 'text-[#00C7BE] dark:text-[#00C7BE]',
        readTime: '4分',
        content: {
          intro: '体の約60%は水分です。適切な水分補給は健康維持に欠かせません。',
          sections: [
            {
              title: '水分の役割',
              points: [
                '栄養素や酸素の運搬',
                '老廃物の排出',
                '体温調節',
                '関節の潤滑',
                '消化を助ける',
              ],
            },
            {
              title: '1日に必要な水分量',
              text:
                '一般的に1日1.5〜2リットルが目安です。運動時や暑い日はさらに多く必要です。体重×30〜40mlが目安という計算式もあります。',
            },
            {
              title: '脱水症状のサイン',
              points: [
                '喉の渇き（すでに脱水状態）',
                '尿の色が濃い（黄色〜琥珀色）',
                '頭痛、めまい',
                '疲労感、集中力低下',
                '便秘',
              ],
            },
            {
              title: '効果的な水分補給',
              points: [
                '喉が渇く前にこまめに飲む',
                '起床時、食事時、運動前後は必ず',
                '一度に大量に飲まず、コップ1杯ずつ',
                'カフェインやアルコールは利尿作用があるので注意',
                '夏場や運動時は電解質も補給',
              ],
            },
          ],
          tips: [
            '朝起きたらまずコップ1杯の水を',
            '常に水筒を持ち歩く習慣を',
            '尿の色が薄い黄色なら適切な水分量',
          ],
        },
      },
      {
        id: 7,
        title: 'PFCバランスの基礎',
        category: '食事バランス',
        icon: '⚖️',
        color: 'from-[#FFCC00]/10 to-[#FFCC00]/5 dark:from-[#FFCC00]/20 dark:to-[#FFCC00]/10',
        borderColor: 'border-[#FFCC00]/20 dark:border-[#FFCC00]/30',
        iconBg: 'bg-[#FFCC00]/20 dark:bg-[#FFCC00]/30',
        iconColor: 'text-[#FFCC00] dark:text-[#FFCC00]',
        readTime: '5分',
        content: {
          intro:
            'PFCバランスとは、Protein（タンパク質）、Fat（脂質）、Carbohydrate（炭水化物）の三大栄養素のバランスです。',
          sections: [
            {
              title: '理想的なPFCバランス',
              points: [
                'タンパク質：13〜20%（体重×1.2〜2.0g）',
                '脂質：20〜30%（総カロリーの）',
                '炭水化物：50〜65%（残り）',
                '※目的に応じて調整が必要',
              ],
            },
            {
              title: '目的別PFCバランス',
              points: [
                '減量（ダイエット）：P 30% / F 20% / C 50%',
                '増量（筋肉増強）：P 25% / F 25% / C 50%',
                '維持（健康維持）：P 15% / F 25% / C 60%',
                '糖質制限：P 30% / F 40% / C 30%',
              ],
            },
            {
              title: 'カロリー計算の基本',
              points: [
                'タンパク質：1gあたり4kcal',
                '脂質：1gあたり9kcal',
                '炭水化物：1gあたり4kcal',
                'アルコール：1gあたり7kcal',
              ],
            },
            {
              title: '実践例（2000kcalの場合）',
              text:
                'タンパク質100g（400kcal）、脂質55g（500kcal）、炭水化物275g（1100kcal）= 2000kcal',
            },
          ],
          tips: [
            'まずは自分の基礎代謝を知ることから',
            'アプリで食事を記録すると管理しやすい',
            '完璧を目指さず、80%できればOK',
          ],
        },
      },
      {
        id: 8,
        title: '食物繊維で腸活',
        category: '食物繊維',
        icon: '🥗',
        color: 'from-[#34C759]/10 to-[#34C759]/5 dark:from-[#00ff41]/20 dark:to-[#00ff41]/10',
        borderColor: 'border-[#34C759]/20 dark:border-[#00ff41]/30',
        iconBg: 'bg-[#34C759]/20 dark:bg-[#00ff41]/30',
        iconColor: 'text-[#34C759] dark:text-[#00ff41]',
        readTime: '5分',
        content: {
          intro:
            '食物繊維は「第6の栄養素」とも呼ばれ、腸内環境を整える重要な役割を果たします。',
          sections: [
            {
              title: '2種類の食物繊維',
              points: [
                '不溶性食物繊維：水に溶けず、便のかさを増やす（野菜、きのこ、穀類）',
                '水溶性食物繊維：水に溶けてゲル状に、血糖値上昇を抑える（海藻、果物、大麦）',
                '理想的な比率は不溶性2:水溶性1',
              ],
            },
            {
              title: '食物繊維の効果',
              points: [
                '便秘解消、腸内環境改善',
                '血糖値の急上昇を抑える',
                'コレステロール値を下げる',
                '満腹感が得られ、食べ過ぎ防止',
                '大腸がん予防',
              ],
            },
            {
              title: '1日の目標摂取量',
              text:
                '成人男性21g以上、女性18g以上が目標です。しかし、日本人の平均摂取量は約14gと不足しています。',
            },
            {
              title: '食物繊維が豊富な食品',
              points: [
                '野菜：ごぼう、ブロッコリー、キャベツ',
                '果物：りんご、バナナ、キウイ',
                '穀類：玄米、オートミール、全粒粉パン',
                '豆類：大豆、小豆、レンズ豆',
                'きのこ・海藻：しいたけ、わかめ、ひじき',
              ],
            },
          ],
          tips: [
            '白米を玄米や雑穀米に変えるだけで大幅アップ',
            '1日350gの野菜を目標に',
            '急に増やすとお腹が張るので徐々に',
          ],
        },
      },
    ],
    []
  )

  // クイズ画面へ切り替え
  if (showQuiz) {
    return <NutritionQuiz theme={theme} onBack={() => setShowQuiz(false)} />
  }

  // 記事詳細を表示
  if (selectedArticle !== null) {
    const article = articles.find((item) => item.id === selectedArticle)
    if (!article) return null

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8faf9] to-[#e8f5ec] dark:from-zinc-950 dark:to-zinc-950 pb-24 transition-colors">
        <div className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 px-6 py-4 transition-colors sticky top-0 z-10">
          <Button
            onClick={() => setSelectedArticle(null)}
            className="rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 mb-2 w-10 h-10 transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </Button>
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 ${article.iconBg} rounded-full flex items-center justify-center text-2xl`}
            >
              {article.icon}
            </div>
            <div>
              <Badge className="mb-2">{article.category}</Badge>
              <h1 className="text-gray-900 dark:text-white">{article.title}</h1>
              <p className="text-sm text-gray-500 dark:text-zinc-400">読了時間: {article.readTime}</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-6 space-y-6">
          <Card className="p-6 rounded-2xl shadow-sm border-gray-100 dark:border-zinc-800 transition-colors">
            <p className="text-gray-700 dark:text-zinc-300 leading-relaxed text-lg">
              {article.content.intro}
            </p>
          </Card>

          {article.content.sections.map((section, index) => (
            <Card
              key={index}
              className="p-6 rounded-2xl shadow-sm border-gray-100 dark:border-zinc-800 transition-colors"
            >
              <h3 className="text-gray-900 dark:text-white mb-4">{section.title}</h3>
              {section.text && (
                <p className="text-gray-700 dark:text-zinc-300 leading-relaxed mb-4">
                  {section.text}
                </p>
              )}
              {section.points && (
                <ul className="space-y-2">
                  {section.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-zinc-300">
                      <span className="text-[#34C759] dark:text-[#00ff41] mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}

          <Card className="p-6 bg-gradient-to-br from-[#FFCC00]/10 to-[#FFCC00]/5 dark:from-[#FFCC00]/20 dark:to-[#FFCC00]/10 rounded-2xl border border-[#FFCC00]/20 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-[#FFCC00]" />
              <h3 className="text-gray-900 dark:text-white">実践のコツ</h3>
            </div>
            <ul className="space-y-2">
              {article.content.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-zinc-300">
                  <span className="text-[#FFCC00] mt-1">💡</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    )
  }

  // 記事一覧画面
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8faf9] to-[#e8f5ec] dark:from-zinc-950 dark:to-zinc-950 pb-24 transition-colors">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card className="p-6 bg-gradient-to-br from-[#FFCC00]/10 to-[#FFCC00]/5 dark:from-[#FFCC00]/20 dark:to-[#FFCC00]/10 rounded-2xl border border-[#FFCC00]/20 dark:border-[#FFCC00]/30 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#FFCC00]/20 dark:bg-[#FFCC00]/30 rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-[#FFCC00]" />
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-white mb-1">栄養学クイズ</h3>
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  楽しく学べる20問のクイズに挑戦！
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowQuiz(true)}
              className="bg-[#FFCC00] hover:bg-[#e6b800] dark:bg-[#00ff41] dark:hover:bg-[#00e63a] dark:text-zinc-950 text-zinc-950 rounded-xl px-6 transition-colors"
            >
              挑戦する
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-[#34C759]/10 to-[#34C759]/5 dark:from-[#00ff41]/20 dark:to-[#00ff41]/10 rounded-2xl border border-[#34C759]/20 dark:border-[#00ff41]/30 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-6 h-6 text-[#34C759] dark:text-[#00ff41]" />
            <h2 className="text-gray-900 dark:text-white">栄養学を学ぼう</h2>
          </div>
          <p className="text-gray-600 dark:text-zinc-400 leading-relaxed">
            健康的な食生活には、栄養の基礎知識が欠かせません。三大栄養素からビタミン・ミネラルまで、わかりやすく解説します。
          </p>
        </Card>

        {!isPremium && (
          <Card className="p-6 bg-white/80 dark:bg-zinc-900 rounded-2xl shadow-sm border-gray-100 dark:border-zinc-800 transition-colors">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-gray-900 dark:text-white mb-1">プレミアムで学習を強化</h3>
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  パーソナライズされた学習プランや追加コンテンツが開放されます。
                </p>
              </div>
              <Button onClick={onUpgrade} className="rounded-xl bg-gray-900 text-white dark:bg-[#00ff41] dark:text-zinc-950 px-5 transition-colors">
                アップグレード
              </Button>
            </div>
          </Card>
        )}

        <div>
          <h3 className="text-gray-900 dark:text-white mb-4 px-2">学習コンテンツ</h3>
          <div className="space-y-3">
            {articles.map((article) => (
              <Card
                key={article.id}
                onClick={() => {
                  setSelectedArticle(article.id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`p-5 bg-gradient-to-br ${article.color} rounded-2xl border ${article.borderColor} transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 ${article.iconBg} rounded-xl flex items-center justify-center text-3xl flex-shrink-0`}>
                    {article.icon}
                  </div>

                  <div className="flex-1">
                    <Badge className="mb-2 text-xs">{article.category}</Badge>
                    <h4 className="text-gray-900 dark:text-white mb-1">{article.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                      読了時間: {article.readTime}
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-6 rounded-2xl shadow-sm border-gray-100 dark:border-zinc-800 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-[#FFCC00]" />
            <h3 className="text-gray-900 dark:text-white">今日の栄養豆知識</h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
              <p className="text-gray-700 dark:text-zinc-300">
                🥚 卵は「完全栄養食品」と呼ばれ、ビタミンC以外のすべての栄養素を含んでいます。
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
              <p className="text-gray-700 dark:text-zinc-300">
                🥦 ブロッコリーはビタミンCがレモンの2倍以上！加熱しすぎないのがコツです。
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
              <p className="text-gray-700 dark:text-zinc-300">
                🥜 ナッツ類は1日手のひら一杯分（約30g）が理想的な摂取量です。
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl shadow-sm border-gray-100 dark:border-zinc-800 transition-colors">
          <h3 className="text-gray-900 dark:text-white mb-4">「まごわやさしい」とは？</h3>
          <div className="space-y-2">
            {[
              { emoji: '🫘', key: 'ま', text: '豆類（大豆、納豆、豆腐）' },
              { emoji: '🌰', key: 'ご', text: 'ごま・ナッツ類' },
              { emoji: '🌊', key: 'わ', text: 'わかめ・海藻類' },
              { emoji: '🥬', key: 'や', text: '野菜' },
              { emoji: '🐟', key: 'さ', text: '魚' },
              { emoji: '🍄', key: 'し', text: 'しいたけ・きのこ類' },
              { emoji: '🥔', key: 'い', text: 'いも類' },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{item.key}</span>
                  <span className="text-gray-600 dark:text-zinc-400"> = {item.text}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default NutritionEducation
