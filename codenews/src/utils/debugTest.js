/**
 * Debug utilities for testing system functionality
 */

export function testStoreImports() {
  console.log("=== TESTE DE IMPORTAÇÃO DOS STORES ===");

  try {
    // Test patient store import
    console.log("Testando import do PatientStore...");
    import("../stores/patient.js")
      .then((module) => {
        console.log("✅ PatientStore importado:", module);
      })
      .catch((error) => {
        console.error("❌ Erro ao importar PatientStore:", error);
      });

    // Test queue store import
    console.log("Testando import do QueueStore...");
    import("../stores/queue.js")
      .then((module) => {
        console.log("✅ QueueStore importado:", module);
      })
      .catch((error) => {
        console.error("❌ Erro ao importar QueueStore:", error);
      });

    // Test validation import
    console.log("Testando import das validações...");
    import("./validation.js")
      .then((module) => {
        console.log("✅ Validações importadas:", module);
      })
      .catch((error) => {
        console.error("❌ Erro ao importar validações:", error);
      });

    // Test error handler import
    console.log("Testando import do error handler...");
    import("./errorHandler.js")
      .then((module) => {
        console.log("✅ Error handler importado:", module);
      })
      .catch((error) => {
        console.error("❌ Erro ao importar error handler:", error);
      });
  } catch (error) {
    console.error("❌ Erro geral no teste de imports:", error);
  }
}

export function testBasicFunctionality() {
  console.log("=== TESTE DE FUNCIONALIDADE BÁSICA ===");

  try {
    // Test localStorage
    console.log("Testando localStorage...");
    const testKey = "debug_test";
    const testValue = { test: true, timestamp: Date.now() };

    localStorage.setItem(testKey, JSON.stringify(testValue));
    const retrieved = JSON.parse(localStorage.getItem(testKey));
    localStorage.removeItem(testKey);

    if (retrieved.test === true) {
      console.log("✅ localStorage funcionando");
    } else {
      console.error("❌ localStorage com problema");
    }

    // Test JSON operations
    console.log("Testando operações JSON...");
    const testObj = { name: "Teste", id: 123, active: true };
    const jsonString = JSON.stringify(testObj);
    const parsedObj = JSON.parse(jsonString);

    if (parsedObj.name === "Teste") {
      console.log("✅ JSON funcionando");
    } else {
      console.error("❌ JSON com problema");
    }

    // Test Date operations
    console.log("Testando operações de data...");
    const now = new Date();
    const isoString = now.toISOString();
    const parsedDate = new Date(isoString);

    if (parsedDate instanceof Date && !isNaN(parsedDate)) {
      console.log("✅ Date funcionando");
    } else {
      console.error("❌ Date com problema");
    }
  } catch (error) {
    console.error("❌ Erro no teste de funcionalidade básica:", error);
  }
}

export function testValidationFunctions() {
  console.log("=== TESTE DAS FUNÇÕES DE VALIDAÇÃO ===");

  try {
    // Import validation functions dynamically
    import("./validation.js")
      .then(({ validatePatientName, validateCid }) => {
        console.log("Testando validatePatientName...");

        const nameTests = [
          { input: "João Silva", expected: null },
          { input: "A", expected: "error" },
          { input: "", expected: "error" },
          { input: "Maria dos Santos", expected: null },
        ];

        nameTests.forEach((test) => {
          const result = validatePatientName(test.input);
          const passed = (result === null) === (test.expected === null);
          console.log(`${passed ? "✅" : "❌"} Nome "${test.input}": ${result || "OK"}`);
        });

        console.log("Testando validateCid...");

        const cidTests = [
          { input: "J06.9", expected: null },
          { input: "I21", expected: null },
          { input: "", expected: null }, // CID is optional
          { input: "invalid", expected: "error" },
        ];

        cidTests.forEach((test) => {
          const result = validateCid(test.input);
          const passed = (result === null) === (test.expected === null);
          console.log(`${passed ? "✅" : "❌"} CID "${test.input}": ${result || "OK"}`);
        });
      })
      .catch((error) => {
        console.error("❌ Erro ao testar validações:", error);
      });
  } catch (error) {
    console.error("❌ Erro no teste de validações:", error);
  }
}

// Auto-run tests when imported in development
if (import.meta.env.DEV) {
  console.log("🔧 Executando testes de debug...");
  testBasicFunctionality();
  testStoreImports();
  testValidationFunctions();
}
