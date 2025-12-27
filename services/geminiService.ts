
import { GoogleGenAI, Type } from "@google/genai";
import { Scope, TransactionResult, OCRResult, QuoteItem, QuoteResult, RFQResult } from "../types";
import { MENUS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Configuration Helpers ---

const getSettings = () => {
  try {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('elitepro_settings');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

const getModel = () => {
  const settings = getSettings();
  // Default to flash if not specified or set to 'flash'
  return settings?.aiModelPreference === 'pro' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
};

const getCurrency = () => {
  const settings = getSettings();
  return settings?.defaultCurrency || 'SAR';
};

/**
 * Categorizes a transaction using the configured model and currency.
 */
export const categorizeTransaction = async (input: string | { data: string, mimeType: string }): Promise<TransactionResult> => {
  const current_date = new Date().toISOString().split('T')[0];
  const currency = getCurrency();
  
  const parts: any[] = [];
  // Use user preference by default, but upgrade to Pro for multimodal inputs (images/docs)
  let model = getModel();

  if (typeof input === 'string') {
    parts.push({ text: `Input: ${input}` });
  } else {
    parts.push({ inlineData: { data: input.data, mimeType: input.mimeType } });
    parts.push({ text: "Analyze this document/image and categorize the transaction." });
    model = 'gemini-3-pro-preview';
  }

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts },
    config: {
      systemInstruction: `You are the AI financial engine for "ElitePro," a dual-mode finance app for a freelancer. The user has a single bank account used for both Personal and Business purposes. Your job is to analyze transaction inputs (text, images, or documents) and output a structured JSON object.

**Context & Entities:**
1. **User (Me):** Freelancer.
2. **JAG Arabia:** A proxy company. Transactions related to "Invoice Request," "JAG Transfer," or "LSA" are Business.
3. **Paul:** A partner/customer. Transactions related to "Commission," "RFQ," or "Paul" are Business.
4. **Suppliers:** Buying food, catering equipment, or labor is usually Business.
5. **Personal:** Groceries, Cinema, Family, Petrol (unless specified for a project), Rent (Home).

**Current Date:** ${current_date}
**Default Currency:** ${currency}

**Output Format (JSON Only):**
{
  "scope": "PERSONAL" | "BUSINESS" | "UNCERTAIN",
  "type": "EXPENSE" | "INCOME" | "TRANSFER",
  "category": "String (e.g., 'Food', 'Transport', 'Supplier Payment', 'JAG Settlement')",
  "amount": Number,
  "currency": "${currency}",
  "description": "Cleaned up description",
  "project_hint": "String (If input mentions a specific project, extract it here, else null)",
  "confidence_score": Number (0-1)
}`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scope: { type: Type.STRING },
          type: { type: Type.STRING },
          category: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          currency: { type: Type.STRING },
          description: { type: Type.STRING },
          project_hint: { type: Type.STRING },
          confidence_score: { type: Type.NUMBER }
        },
        required: ["scope", "type", "category", "amount", "currency", "description", "project_hint", "confidence_score"]
      }
    }
  });

  return JSON.parse(response.text);
};

/**
 * Scans a receipt/invoice and extracts structured data.
 */
export const scanReceipt = async (base64Data: string, mimeType: string): Promise<OCRResult> => {
  const currency = getCurrency();
  // Always use Pro for heavy OCR tasks
  const model = 'gemini-3-pro-preview';

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: "Analyze this financial document. Extract the data into strict JSON format." }
      ]
    },
    config: {
      systemInstruction: `Analyze this financial document (Image, PDF, or Text). It is either a Supplier Invoice, a Receipt, or a Payment Proof.
Extract the following data into strict JSON format.

**Requirements:**
1. **Vendor:** Name of the shop/supplier.
2. **Date:** YYYY-MM-DD format.
3. **Total Amount:** The final grand total.
4. **Currency:** The detected currency (e.g., ${currency}, USD). Default to ${currency}.
5. **Line Items:** An array of items purchased (Quantity, Description, Unit Price).
6. **Tax:** Total VAT/Tax amount if visible.
7. **Doc Type:** "RECEIPT", "INVOICE", or "TRANSFER_PROOF".

**Special Logic for 'Catering':**
- If the items are food ingredients (Rice, Meat, Vegetables) in bulk, flag 'is_catering_supply' as true.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vendor_name: { type: Type.STRING },
          date: { type: Type.STRING },
          total: { type: Type.NUMBER },
          currency: { type: Type.STRING },
          tax_amount: { type: Type.NUMBER },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                qty: { type: Type.NUMBER },
                desc: { type: Type.STRING },
                price: { type: Type.NUMBER }
              },
              required: ["qty", "desc", "price"]
            }
          },
          document_type: { type: Type.STRING },
          is_catering_supply: { type: Type.BOOLEAN }
        },
        required: ["vendor_name", "date", "total", "currency", "tax_amount", "items", "document_type", "is_catering_supply"]
      }
    }
  });

  return JSON.parse(response.text);
};

/**
 * Generates a quote with optional deep market analysis and negotiation logic.
 */
export const generateQuote = async (clientName: string, items: QuoteItem[], commission: number, margin: number, deepAnalysis: boolean = false): Promise<QuoteResult> => {
  const currency = getCurrency();
  const response = await ai.models.generateContent({
    model: getModel(), // Uses configurable model
    contents: `Client: ${clientName}, Items: ${JSON.stringify(items)}, Commission: ${commission}%, Profit Goal: ${margin}%, Deep Analysis Enabled: ${deepAnalysis}, Currency: ${currency}`,
    config: {
      systemInstruction: `You are an expert Estimation Engineer for a Catering & Services company in Saudi Arabia. 

**Negotiation Loop Protocol:**
Your output is part of a 6-stage state machine:
- DRAFT: Initial creation.
- VALIDATION_PENDING: Sent to Paul/JAG for approval.
- NEGOTIATION: If rejected, Paul adds comments; Firash revises.
- APPROVED: Finalized pricing.
- AWAITING_ADVANCE: Waiting for payment slip.
- ACTIVE: Work execution.

**Task:**
1. Calculate the 'Suggested Sell Price' for each item to hit the Profit Goal AFTER deducting the commission percentage for Paul.
2. Write a professional "Scope of Work" description.
3. ${deepAnalysis ? 'PERFORM DEEP ANALYSIS: For each item, provide detailed reasoning that considers current Saudi market trends (Jeddah/Riyadh), competitor analysis, and inflation impact.' : 'Provide concise cost-based reasoning.'}
4. Flag any potential conflicts.
5. All monetary values must be in ${currency}.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          calculated_items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                base_cost: { type: Type.NUMBER },
                suggested_sell_price: { type: Type.NUMBER },
                reasoning: { type: Type.STRING }
              },
              required: ["item", "base_cost", "suggested_sell_price", "reasoning"]
            }
          },
          scope_of_work_text: { type: Type.STRING },
          warnings: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["calculated_items", "scope_of_work_text", "warnings"]
      }
    }
  });

  return JSON.parse(response.text);
};

/**
 * Matches RFQs to standard menu packages and assigns initial workflow state.
 */
export const analyzeRFQ = async (input: string | { data: string, mimeType: string }): Promise<RFQResult> => {
  const parts: any[] = [];
  // Use user preference by default, but upgrade to Pro for multimodal inputs
  let model = getModel();

  if (typeof input === 'string') {
    parts.push({ text: `RFQ Input: ${input}` });
  } else {
    parts.push({ inlineData: { data: input.data, mimeType: input.mimeType } });
    parts.push({ text: "Analyze this RFQ document and extract details." });
    model = 'gemini-3-pro-preview';
  }
  parts.push({ text: `Available Menus: ${JSON.stringify(MENUS)}` });

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts },
    config: {
      systemInstruction: `You are a Project Coordinator. Match RFQ input to standard Menu Packages. Identify logistics and draft a response. 
      Initial state will be set to 'ACTION_REQUIRED' in the inbox column.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggested_package_id: { type: Type.STRING },
          logistics: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              location: { type: Type.STRING },
              pax: { type: Type.NUMBER }
            },
            required: ["date", "location", "pax"]
          },
          missing_info: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          draft_reply_to_paul: { type: Type.STRING }
        },
        required: ["suggested_package_id", "logistics", "missing_info", "draft_reply_to_paul"]
      }
    }
  });

  return JSON.parse(response.text);
};
