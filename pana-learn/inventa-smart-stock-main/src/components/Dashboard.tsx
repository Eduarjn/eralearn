
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, AlertTriangle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Dashboard() {
  const stats = [
    { title: "Total de Produtos", value: "1,247", icon: Package, change: "+12%", color: "text-blue-600" },
    { title: "Vendas do Mês", value: "R$ 45.231", icon: TrendingUp, change: "+23%", color: "text-green-600" },
    { title: "Estoque Baixo", value: "18", icon: AlertTriangle, change: "-8%", color: "text-orange-600" },
    { title: "Clientes Ativos", value: "342", icon: Users, change: "+15%", color: "text-purple-600" },
  ];

  const recentMovements = [
    { product: "Smartphone Galaxy S23", type: "Saída", quantity: 2, time: "há 15 min" },
    { product: "Notebook Dell Inspiron", type: "Entrada", quantity: 5, time: "há 1 hora" },
    { product: "Mouse Logitech MX", type: "Saída", quantity: 1, time: "há 2 horas" },
    { product: "Teclado Mecânico", type: "Entrada", quantity: 10, time: "há 3 horas" },
  ];

  const lowStock = [
    { product: "iPhone 14 Pro", current: 3, minimum: 10 },
    { product: "AirPods Pro", current: 5, minimum: 15 },
    { product: "MacBook Air M2", current: 2, minimum: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do seu estoque</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">Exportar Relatório</Button>
          <Button>+ Novo Produto</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-600 mt-1">
                <span className={`${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span> em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Movements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Movimentações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMovements.map((movement, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{movement.product}</p>
                    <p className="text-sm text-gray-600">{movement.time}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      movement.type === 'Entrada' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {movement.type}: {movement.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              Alertas de Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStock.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.product}</p>
                    <p className="text-sm text-gray-600">Estoque atual: {item.current} | Mínimo: {item.minimum}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-orange-600 border-orange-300 hover:bg-orange-100">
                    Repor
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
