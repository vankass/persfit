import { Card } from "../card"

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <Card className="p-6 border-none shadow-sm bg-white rounded-3xl space-y-3">
      <div className="p-3 bg-slate-50 w-fit rounded-2xl">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 leading-snug">{desc}</p>
    </Card>
  )
}

export default FeatureCard