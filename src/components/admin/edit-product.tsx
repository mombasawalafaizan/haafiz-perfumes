"use client";

import { useState } from "react";
import { IProductDetail } from "@/types/product";
import EditProductInfo from "@/components/admin/edit-product-info";
import { VariantManagement } from "@/components/admin/variant-management";

interface EditProductProps {
  isOpen: boolean;
  product?: IProductDetail;
  onClose: (saved?: boolean) => void;
}

function EditProduct({ isOpen, onClose, product }: EditProductProps) {
  const [hasMadeChanges, setHasMadeChanges] = useState(false);
  const [savedProductId, setSavedProductId] = useState<string>(
    product?.id || ""
  );
  const [currentStep, setCurrentStep] = useState<"product" | "variants">(
    "product"
  );

  const handleCloseProductsInfo = (
    saved?: boolean,
    options?: { showVariants?: boolean; productId?: string }
  ) => {
    const anyChanges = saved === true || hasMadeChanges;

    if (options?.productId) setSavedProductId(options.productId);
    if (saved === true) setHasMadeChanges(true);

    if (options?.showVariants === true) setCurrentStep("variants");
    else onClose(anyChanges);
    // revalidate path here TODO: changes
  };

  const handleSaveVariants = (
    saved?: boolean,
    options?: { showProductInfo?: boolean }
  ) => {
    const anyChanges = saved === true || hasMadeChanges;
    if (saved === true) setHasMadeChanges(true);

    if (options?.showProductInfo === true) setCurrentStep("product");
    else onClose(anyChanges);
    // revalidate path here TODO: changes
  };

  return (
    <>
      {currentStep === "product" && (
        <EditProductInfo
          isOpen={isOpen}
          onClose={handleCloseProductsInfo}
          product={product}
        />
      )}
      {currentStep === "variants" && (
        <VariantManagement
          isOpen={isOpen}
          productId={savedProductId}
          onSave={handleSaveVariants}
        />
      )}
    </>
  );
}

export default EditProduct;
