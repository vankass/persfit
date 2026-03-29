import { useState } from "react"
import { Button } from "@/components/ui/button" 
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Scale, Ruler } from "lucide-react"

export default function Onboarding() {
  const [formData, setFormData] = useState({
    name: "",
    weight: "",
    height: ""
  })

  const handleFinish = () => {
    console.log("Данные для сохранения:", formData)
    alert("Данные получены! Скоро мы подключим базу данных.")
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Расскажи о себе</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" /> Имя
            </label>
            <Input 
              placeholder="Как тебя зовут?" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Scale className="w-4 h-4 text-green-500" /> Вес (кг)
              </label>
              <Input 
                type="number" 
                placeholder="70" 
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Ruler className="w-4 h-4 text-purple-500" /> Рост (см)
              </label>
              <Input 
                type="number" 
                placeholder="180" 
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: e.target.value})}
                className="rounded-xl"
              />
            </div>
          </div>

          <Button 
            className="w-full py-6 text-lg rounded-2xl bg-blue-600 hover:bg-blue-700 mt-4"
            onClick={handleFinish}
          >
            Готово
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}