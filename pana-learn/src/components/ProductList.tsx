import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Minus, Edit, Eye } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  stock: number;
  minStock: number;
  status: string;
  image: string;
}

export function ProductList() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "iPhone 14 Pro",
      category: "Smartphones",
      price: "R$ 8.999,00",
      stock: 15,
      minStock: 10,
      status: "normal",
      image: "photo-1511707171634-5f897ff02aa9"
    },
    {
      id: 2,
      name: "Samsung Galaxy S23",
      category: "Smartphones",
      price: "R$ 4.599,00",
      stock: 3,
      minStock: 10,
      status: "low",
      image: "photo-1511707171634-5f897ff02aa9"
    },
    {
      id: 3,
      name: "MacBook Air M2",
      category: "Notebooks",
      price: "R$ 12.999,00",
      stock: 8,
      minStock: 5,
      status: "normal",
      image: "photo-1517336714731-489689fd1ca4"
    },
    {
      id: 4,
      name: "AirPods Pro",
      category: "Acessórios",
      price: "R$ 2.799,00",
      stock: 0,
      minStock: 15,
      status: "out",
      image: "photo-1505740420928-5e560c06d30e"
    },
  ]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'bg-orange-100 text-orange-800';
      case 'out': return 'bg-red-100 text-red-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'low': return 'Estoque Baixo';
      case 'out': return 'Sem Estoque';
      default: return 'Normal';
    }
  };

  const updateProductStatus = (productId: number, newStock: number) => {
    setProducts(prevProducts => 
      prevProducts.map(product => {
        if (product.id === productId) {
          let status = "normal";
          if (newStock === 0) status = "out";
          else if (newStock <= product.minStock) status = "low";
          
          return { ...product, stock: newStock, status };
        }
        return product;
      })
    );
  };

  const handleNewProduct = () => {
    toast({ 
      title: 'Novo Produto', 
      description: 'Funcionalidade de adicionar novo produto será implementada em breve.' 
    });
  };

  const handleViewProduct = (product: Product) => {
    toast({ 
      title: 'Visualizar Produto', 
      description: `Visualizando detalhes de: ${product.name}` 
    });
  };

  const handleEditProduct = (product: Product) => {
    toast({ 
      title: 'Editar Produto', 
      description: `Editando produto: ${product.name}` 
    });
  };

  const handleIncreaseStock = (productId: number, currentStock: number) => {
    updateProductStatus(productId, currentStock + 1);
    toast({ 
      title: 'Estoque Atualizado', 
      description: 'Quantidade aumentada com sucesso.' 
    });
  };

  const handleDecreaseStock = (productId: number, currentStock: number) => {
    if (currentStock > 0) {
      updateProductStatus(productId, currentStock - 1);
      toast({ 
        title: 'Estoque Atualizado', 
        description: 'Quantidade diminuída com sucesso.' 
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">Gerencie seu catálogo de produtos</p>
        </div>
        <Button onClick={handleNewProduct}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar produtos por nome ou categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                <img 
                  src={`https://images.unsplash.com/${product.image}?w=300&h=300&fit=crop`}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <p className="text-sm text-gray-600">{product.category}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">{product.price}</span>
                <Badge className={getStatusColor(product.status)}>
                  {getStatusText(product.status)}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Estoque:</span>
                <span className="font-medium">{product.stock} unidades</span>
              </div>

              {/* Stock Control */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={product.stock <= 0}
                  className="h-8 w-8 p-0"
                  onClick={() => handleDecreaseStock(product.id, product.stock)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-medium text-lg">{product.stock}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => handleIncreaseStock(product.id, product.stock)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleViewProduct(product)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEditProduct(product)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
