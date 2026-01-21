"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import { vatApi } from "@/lib/medusa";

interface VatInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidation: (result: {
    valid: boolean;
    companyName?: string;
    isReverseCharge?: boolean;
  }) => void;
  disabled?: boolean;
}

export default function VatInput({
  value,
  onChange,
  onValidation,
  disabled = false,
}: VatInputProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    name?: string;
    error?: string;
    isReverseCharge?: boolean;
  } | null>(null);

  // Debounced validation
  const validateVat = useCallback(async (vatNumber: string) => {
    if (!vatNumber || vatNumber.length < 8) {
      setValidationResult(null);
      onValidation({ valid: false });
      return;
    }

    setIsValidating(true);

    try {
      // First validate the VAT number
      const result = await vatApi.validate(vatNumber);

      if (result.valid) {
        // Check if reverse charge applies
        const reverseChargeResult = await vatApi.checkReverseCharge(vatNumber);

        const fullResult = {
          valid: true,
          name: result.name,
          isReverseCharge: reverseChargeResult.reverseCharge,
        };

        setValidationResult(fullResult);
        onValidation({
          valid: true,
          companyName: result.name,
          isReverseCharge: reverseChargeResult.reverseCharge,
        });
      } else {
        setValidationResult({
          valid: false,
          error: result.error,
        });
        onValidation({ valid: false });
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        error: "Validation service unavailable",
      });
      onValidation({ valid: false });
    } finally {
      setIsValidating(false);
    }
  }, [onValidation]);

  // Debounce validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value && value.length >= 8) {
        validateVat(value);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [value, validateVat]);

  const getInputClassName = () => {
    const base = "w-full rounded-md shadow-sm pr-10 transition-colors";

    if (isValidating) {
      return `${base} border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500`;
    }

    if (validationResult?.valid) {
      return `${base} border-green-500 focus:border-green-500 focus:ring-green-500`;
    }

    if (validationResult && !validationResult.valid) {
      return `${base} border-red-500 focus:border-red-500 focus:ring-red-500`;
    }

    return `${base} border-gray-300 focus:border-primary-500 focus:ring-primary-500`;
  };

  return (
    <div className="space-y-2">
      <label htmlFor="vat_number" className="block text-sm font-medium text-gray-700">
        VAT Number (Optional - for B2B)
      </label>

      <div className="relative">
        <input
          type="text"
          id="vat_number"
          name="vat_number"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="e.g., BE0123456789"
          disabled={disabled}
          className={getInputClassName()}
        />

        {/* Status icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isValidating && (
            <ArrowPathIcon className="h-5 w-5 text-yellow-500 animate-spin" />
          )}
          {!isValidating && validationResult?.valid && (
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          )}
          {!isValidating && validationResult && !validationResult.valid && value.length >= 8 && (
            <XCircleIcon className="h-5 w-5 text-red-500" />
          )}
        </div>
      </div>

      {/* Validation feedback */}
      {validationResult?.valid && (
        <div className="rounded-md bg-green-50 p-3">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Valid VAT Number
              </p>
              {validationResult.name && (
                <p className="text-sm text-green-700 mt-1">
                  {validationResult.name}
                </p>
              )}
              {validationResult.isReverseCharge && (
                <p className="text-sm text-green-700 mt-1 font-medium">
                  ✓ Reverse charge applies - 0% VAT
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {validationResult && !validationResult.valid && value.length >= 8 && (
        <div className="rounded-md bg-red-50 p-3">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Invalid VAT Number
              </p>
              <p className="text-sm text-red-700 mt-1">
                {validationResult.error || "Please check the VAT number and try again."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-gray-500">
        Enter your EU VAT number to validate. Business customers in EU countries
        (except Belgium) may qualify for reverse charge (0% VAT).
      </p>
    </div>
  );
}
