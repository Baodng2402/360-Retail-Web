import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import {
    ArrowLeft,
    Package,
    DollarSign,
    TrendingUp,
    Edit,
    CheckCircle,
    XCircle,
    Loader2,
    Save,
    Trash2,
    Plus,
    ImageIcon,
    Barcode,
    Grid3x3,
} from "lucide-react";
import { productsApi } from "@/shared/lib/productsApi";
import { categoriesApi } from "@/shared/lib/categoriesApi";
import { useStoreStore } from "@/shared/store/storeStore";
import type { Product, ProductVariant } from "@/shared/types/products";
import type { Category } from "@/shared/types/categories";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

type VariantForm = {
    sku: string;
    size: string;
    color: string;
    priceOverride: string;
    stockQuantity: string;
};

const ProductDetailPage = () => {
    const { t: tProduct, i18n } = useTranslation(["product", "common"]);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { currentStore } = useStoreStore();
    const storeId = currentStore?.id;

    const [product, setProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [productName, setProductName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [price, setPrice] = useState("");
    const [costPrice, setCostPrice] = useState("");
    const [stockQuantity, setStockQuantity] = useState("");
    const [barCode, setBarCode] = useState("");
    const [description, setDescription] = useState("");
    const [hasVariants, setHasVariants] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [variants, setVariants] = useState<VariantForm[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Load data
    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const [productData, categoriesData] = await Promise.all([
                    productsApi.getProductById(id, storeId),
                    storeId ? categoriesApi.getCategories(storeId) : Promise.resolve([]),
                ]);
                setProduct(productData);
                setCategories(categoriesData);
                initForm(productData);
            } catch (err) {
                console.error("Failed to load product:", err);
                toast.error(tProduct("product:detail.toasts.loadFailed"));
                navigate("/dashboard/products");
            } finally {
                setLoading(false);
            }
        };
        void loadData();
    }, [id, storeId, navigate]);

    const initForm = (p: Product) => {
        const hasVar = Boolean(p.hasVariants || (p.variants && p.variants.length > 0));
        setProductName(p.productName);
        setCategoryId(p.categoryId);
        setPrice(p.price.toString());
        setCostPrice(p.costPrice?.toString() || "");
        setStockQuantity(hasVar ? "0" : p.stockQuantity.toString());
        setBarCode(p.barCode || "");
        setDescription(p.description || "");
        setHasVariants(hasVar);
setIsActive(p.isActive as boolean);
        setImagePreview(p.imageUrl || null);

        if (hasVar && p.variants) {
            setVariants(
                p.variants.map((v) => ({
                    sku: v.sku || "",
                    size: v.size || "",
                    color: v.color || "",
                    priceOverride: v.priceOverride?.toString() || "",
                    stockQuantity: v.stockQuantity?.toString() || "0",
                })),
            );
        } else {
            setVariants([]);
        }
    };

    const totalStock = product?.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0)
        ?? product?.stockQuantity ?? 0;
    const profit = costPrice ? parseFloat(price) - parseFloat(costPrice) : 0;
    const margin = price && parseFloat(price) > 0 ? (profit / parseFloat(price)) * 100 : 0;

    const addVariant = () => {
        setVariants([...variants, { sku: "", size: "", color: "", priceOverride: "", stockQuantity: "0" }]);
    };

    const updateVariant = (index: number, field: keyof VariantForm, value: string) => {
        setVariants(variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
    };

    const removeVariant = (index: number) => {
        if (variants.length <= 1) {
            toast.error(tProduct("product:detail.toasts.minOneVariant"));
            return;
        }
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!product) return;
        if (!productName.trim()) {
            toast.error(tProduct("product:detail.toasts.productNameRequired"));
            return;
        }
        if (!price || parseFloat(price) <= 0) {
            toast.error(tProduct("product:detail.toasts.priceInvalid"));
            return;
        }

        setSaving(true);
        try {
            const variantsPayload: ProductVariant[] | undefined = hasVariants
                ? variants.map((v) => ({
                      sku: v.sku.trim(),
                      size: v.size.trim() || undefined,
                      color: v.color.trim() || undefined,
                      priceOverride: v.priceOverride ? parseFloat(v.priceOverride) : undefined,
                      stockQuantity: parseInt(v.stockQuantity) || 0,
                  }))
                : undefined;

            await productsApi.updateProduct(product.id, {
                id: product.id,
                productName: productName.trim(),
                categoryId,
                barCode: barCode || undefined,
                description: description || undefined,
                price: parseFloat(price),
                costPrice: costPrice ? parseFloat(costPrice) : undefined,
                stockQuantity: hasVariants ? 0 : parseInt(stockQuantity) || 0,
                isActive,
                hasVariants,
                variantsJson: hasVariants && variantsPayload ? JSON.stringify(variantsPayload) : undefined,
            });

            toast.success(tProduct("product:detail.toasts.updateSuccess"));
            setEditing(false);
            // Reload
            const updated = await productsApi.getProductById(product.id, storeId);
            setProduct(updated);
        } catch (err: unknown) {
            console.error("Failed to save product:", err);
            toast.error(tProduct("product:detail.toasts.updateFailed"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="space-y-4">
                <Button variant="outline" onClick={() => navigate("/dashboard/products")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {tProduct("common:actions.back")}
                </Button>
                <Card className="p-6 text-center text-muted-foreground">
                    {tProduct("product:detail.states.notFound")}
                </Card>
            </div>
        );
    }

    const category = categories.find((c) => c.id === product.categoryId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate("/dashboard/products")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{product.productName}</h1>
                        <p className="text-sm text-muted-foreground">
                            {category?.categoryName || tProduct("product:detail.categoryFallback")}
                            {product.hasVariants && (
                                <Badge variant="outline" className="ml-2">
                                    {tProduct("product:detail.badges.hasVariants")}
                                </Badge>
                            )}
                        </p>
                    </div>
                </div>
                {!editing && (
                    <Button
                        onClick={() => {
                            initForm(product);
                            setEditing(true);
                        }}
                        className="gap-2"
                    >
                        <Edit className="h-4 w-4" />
                        {tProduct("common:actions.edit")}
                    </Button>
                )}
            </div>

            {editing ? (
                /* EDIT MODE */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6 space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Package className="h-5 w-5 text-teal-500" />
                                {tProduct("product:detail.sections.basicInfo")}
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{tProduct("product:detail.form.productName")} *</Label>
                                    <Input value={productName} onChange={(e) => setProductName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>{tProduct("product:detail.form.productCode")}</Label>
                                    <Input value={barCode} onChange={(e) => setBarCode(e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{tProduct("product:detail.form.category")} *</Label>
                                    <Select value={categoryId} onValueChange={setCategoryId}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.categoryName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>{tProduct("product:detail.form.status")}</Label>
                                    <div className="flex items-center gap-3 h-10 px-3 border rounded-md">
                                        <span className={isActive ? "text-green-600" : "text-red-500"}>
                                            {isActive ? tProduct("product:active.active") : tProduct("product:active.inactive")}
                                        </span>
                                        <Switch checked={isActive} onCheckedChange={setIsActive} className="ml-auto" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>{tProduct("product:detail.form.price")} *</Label>
                                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>{tProduct("product:detail.form.costPrice")}</Label>
                                    <Input type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>{tProduct("product:detail.form.stock")}</Label>
                                    <Input
                                        type="number"
                                        value={stockQuantity}
                                        onChange={(e) => setStockQuantity(e.target.value)}
                                        disabled={hasVariants}
                                    />
                                    {hasVariants && (
                                        <p className="text-xs text-muted-foreground">{tProduct("product:detail.form.stockByVariantsHint")}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>{tProduct("product:detail.form.description")}</Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </Card>

                        {/* Variants */}
                        <Card className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Grid3x3 className="h-5 w-5 text-purple-500" />
                                    {tProduct("product:detail.sections.variants")}
                                </h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-muted-foreground">{tProduct("product:detail.form.hasVariants")}</span>
                                    <Switch checked={hasVariants} onCheckedChange={setHasVariants} />
                                </div>
                            </div>

                            {hasVariants && (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2">
                                        <div className="col-span-3">{tProduct("product:detail.variantsTable.sku")}</div>
                                        <div className="col-span-2">{tProduct("product:detail.variantsTable.size")}</div>
                                        <div className="col-span-2">{tProduct("product:detail.variantsTable.color")}</div>
                                        <div className="col-span-2">{tProduct("product:detail.variantsTable.priceOverride")}</div>
                                        <div className="col-span-2">{tProduct("product:detail.variantsTable.stock")}</div>
                                        <div className="col-span-1"></div>
                                    </div>

                                    {variants.map((variant, index) => (
                                        <div
                                            key={index}
                                            className="grid grid-cols-12 gap-2 items-center bg-muted/30 p-3 rounded-lg"
                                        >
                                            <Input
                                                className="col-span-3 h-9"
                                                value={variant.sku}
                                                onChange={(e) => updateVariant(index, "sku", e.target.value)}
                                                placeholder={tProduct("product:detail.variantsTable.skuPlaceholder")}
                                            />
                                            <Input
                                                className="col-span-2 h-9"
                                                value={variant.size}
                                                onChange={(e) => updateVariant(index, "size", e.target.value)}
                                                placeholder="M"
                                            />
                                            <Input
                                                className="col-span-2 h-9"
                                                value={variant.color}
                                                onChange={(e) => updateVariant(index, "color", e.target.value)}
                                                placeholder="Đen"
                                            />
                                            <Input
                                                className="col-span-2 h-9"
                                                type="number"
                                                value={variant.priceOverride}
                                                onChange={(e) => updateVariant(index, "priceOverride", e.target.value)}
                                                placeholder={tProduct("product:detail.variantsTable.priceOverridePlaceholder")}
                                            />
                                            <Input
                                                className="col-span-2 h-9"
                                                type="number"
                                                value={variant.stockQuantity}
                                                onChange={(e) => updateVariant(index, "stockQuantity", e.target.value)}
                                                placeholder="0"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="col-span-1 h-9 text-red-500"
                                                onClick={() => removeVariant(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    <Button type="button" variant="outline" onClick={addVariant} className="w-full border-dashed">
                                        <Plus className="h-4 w-4 mr-2" />
                                        {tProduct("product:detail.actions.addVariant")}
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Right - Image & Stats */}
                    <div className="space-y-6">
                        <Card className="p-6 space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-blue-500" />
                                {tProduct("product:detail.sections.image")}
                            </h3>
                            <div className="space-y-2">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setImagePreview(reader.result as string);
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                {(imagePreview || product.imageUrl) && (
                                    <img
                                        src={imagePreview || product.imageUrl || ""}
                                        alt={product.productName}
                                        className="w-full h-48 object-cover rounded-lg border"
                                    />
                                )}
                            </div>
                        </Card>

                        {/* Quick Stats */}
                        <Card className="p-6 space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                {tProduct("product:detail.sections.quickStats")}
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{tProduct("product:detail.stats.totalStock")}</span>
                                    <span className="font-semibold">{totalStock}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{tProduct("product:detail.stats.price")}</span>
                                    <span className="font-semibold text-teal-600">
                                        {parseFloat(price).toLocaleString(i18n.language)}đ
                                    </span>
                                </div>
                                {costPrice && parseFloat(costPrice) > 0 && (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">{tProduct("product:detail.stats.costPrice")}</span>
                                            <span className="font-semibold">
                                                {parseFloat(costPrice).toLocaleString(i18n.language)}đ
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">{tProduct("product:detail.stats.profit")}</span>
                                            <span className="font-semibold text-green-600">
                                                +{profit.toLocaleString(i18n.language)}đ ({margin.toFixed(1)}%)
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            ) : (
                /* VIEW MODE */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product Info Card */}
                        <Card className="overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                                {/* Image */}
                                <div className="w-full md:w-1/3 bg-muted/30 flex items-center justify-center p-6">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.productName}
                                            className="w-full max-w-[250px] h-auto object-cover rounded-xl shadow-lg"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 bg-muted rounded-xl flex items-center justify-center">
                                            <Package className="h-16 w-16 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 p-6 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold">{product.productName}</h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                {category && (
                                                <Badge>
                                                    {category.categoryName}
                                                </Badge>
                                                )}
                                                <Badge variant="outline">
                                                    {product.hasVariants
                                                      ? tProduct("product:detail.badges.hasVariants")
                                                      : tProduct("product:detail.badges.noVariants")}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Badge
                                            className={
                                                product.isActive !== false
                                                    ? "bg-green-500 text-white"
                                                    : "bg-gray-500 text-white"
                                            }
                                        >
                                            {product.isActive !== false ? (
                                                <>
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    {tProduct("product:active.active")}
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    {tProduct("product:active.inactiveShort")}
                                                </>
                                            )}
                                        </Badge>
                                    </div>

                                    {/* Price & Stock Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-br from-teal-50 to-white dark:from-teal-950/20 dark:to-background p-4 rounded-xl border border-teal-200 dark:border-teal-900">
                                            <div className="flex items-center gap-2 text-teal-600 mb-1">
                                                <DollarSign className="h-4 w-4" />
                                                <span className="text-sm font-medium">{tProduct("product:detail.stats.price")}</span>
                                            </div>
                                            <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">
                                                {product.price.toLocaleString(i18n.language)}đ
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background p-4 rounded-xl border border-blue-200 dark:border-blue-900">
                                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                                                <Package className="h-4 w-4" />
                                                <span className="text-sm font-medium">{tProduct("product:detail.form.stock")}</span>
                                            </div>
                                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                                {totalStock}
                                                {product.hasVariants && (
                                                    <span className="text-sm font-normal ml-1">
                                                        ({product.variants?.length} variants)
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Cost & Profit */}
                                    {product.costPrice && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-muted/50 p-3 rounded-lg">
                                                <p className="text-xs text-muted-foreground">{tProduct("product:detail.stats.costPrice")}</p>
                                                <p className="font-semibold">
                                                    {product.costPrice.toLocaleString(i18n.language)}đ
                                                </p>
                                            </div>
                                            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-900">
                                                <p className="text-xs text-green-600 dark:text-green-400">{tProduct("product:detail.stats.profit")}</p>
                                                <p className="font-semibold text-green-600 dark:text-green-400">
                                                    +{(product.price - product.costPrice).toLocaleString(i18n.language)}đ
                                                    <span className="text-xs font-normal ml-1">
                                                        (
                                                        {(
                                                            ((product.price - product.costPrice) / product.price) *
                                                            100
                                                        ).toFixed(1)}
                                                        %)
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Barcode */}
                                    {product.barCode && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Barcode className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">SKU:</span>
                                            <code className="bg-muted px-2 py-0.5 rounded font-mono text-xs">
                                                {product.barCode}
                                            </code>
                                        </div>
                                    )}

                                    {/* Description */}
                                    {product.description && (
                                        <div className="pt-2 border-t">
                                            <p className="text-sm text-muted-foreground mb-1">{tProduct("product:detail.form.description")}</p>
                                            <p className="text-sm">{product.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Variants Table */}
                        {product.hasVariants && product.variants && product.variants.length > 0 && (
                            <Card className="p-6">
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <Grid3x3 className="h-5 w-5 text-purple-500" />
                                    Danh sách biến thể ({product.variants.length})
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="text-left py-3 px-4 font-medium">{tProduct("product:detail.variantsTable.sku")}</th>
                                                <th className="text-left py-3 px-4 font-medium">{tProduct("product:detail.variantsTable.size")}</th>
                                                <th className="text-left py-3 px-4 font-medium">{tProduct("product:detail.variantsTable.color")}</th>
                                                <th className="text-right py-3 px-4 font-medium">{tProduct("product:detail.variantsTable.price")}</th>
                                                <th className="text-right py-3 px-4 font-medium">{tProduct("product:detail.variantsTable.stock")}</th>
                                                <th className="text-center py-3 px-4 font-medium">{tProduct("product:detail.variantsTable.status")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {product.variants.map((variant, index) => {
                                                const variantPrice = variant.priceOverride ?? product.price;
                                                return (
                                                    <tr key={variant.id || index} className="border-b last:border-0">
                                                        <td className="py-3 px-4">
                                                            <code className="text-xs bg-muted px-2 py-1 rounded">
                                                                {variant.sku || "-"}
                                                            </code>
                                                        </td>
                                                        <td className="py-3 px-4">{variant.size || "-"}</td>
                                                        <td className="py-3 px-4">{variant.color || "-"}</td>
                                                        <td className="py-3 px-4 text-right font-medium">
                                                            {variantPrice.toLocaleString(i18n.language)}đ
                                                            {variant.priceOverride && (
                                                                <span className="text-xs text-muted-foreground ml-1">
                                                                    {tProduct("product:detail.variantsTable.overrideBadge")}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <span
                                                                className={
                                                                    (variant.stockQuantity ?? 0) <= 5
                                                                        ? "text-red-500 font-medium"
                                                                        : ""
                                                                }
                                                            >
                                                                {variant.stockQuantity ?? 0}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(variant.stockQuantity ?? 0) > 0 ? (
                                                                <Badge className="bg-green-500 text-white text-xs">
                                                                    {tProduct("product:status.inStock")}
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="destructive" className="text-xs">
                                                                    {tProduct("product:status.outOfStock")}
                                                                </Badge>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card className="p-6 space-y-3">
                            <h3 className="font-semibold">{tProduct("product:detail.sections.quickActions")}</h3>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => navigate(`/dashboard/inventory?product=${product.id}`)}
                            >
                                <Package className="h-4 w-4 mr-2" />
                                {tProduct("product:detail.actions.inventoryInOut")}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => navigate("/dashboard/sales")}
                            >
                                <DollarSign className="h-4 w-4 mr-2" />
                                {tProduct("product:detail.actions.sales")}
                            </Button>
                        </Card>

                        {/* Product Meta */}
                        <Card className="p-6 space-y-3">
                            <h3 className="font-semibold">{tProduct("product:detail.sections.meta")}</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{tProduct("product:detail.meta.id")}</span>
                                    <code className="text-xs">{product.id.slice(0, 8)}...</code>
                                </div>
                                {product.createdAt && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{tProduct("product:detail.meta.createdAt")}</span>
                                        <span>{new Date(product.createdAt).toLocaleDateString(i18n.language)}</span>
                                    </div>
                                )}
                                {product.updatedAt && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{tProduct("product:detail.meta.updatedAt")}</span>
                                        <span>{new Date(product.updatedAt).toLocaleDateString(i18n.language)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{tProduct("product:detail.meta.variantsCount")}</span>
                                    <span>{product.variants?.length || 0}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* Edit Actions */}
            {editing && (
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50">
                    <div className="container mx-auto flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                initForm(product);
                                setEditing(false);
                            }}
                            disabled={saving}
                        >
                            {tProduct("common:actions.cancel")}
                        </Button>
                        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            <Save className="h-4 w-4" />
                            {tProduct("common:actions.saveChanges")}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;
