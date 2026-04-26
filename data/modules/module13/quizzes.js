Object.assign(QUIZZES, {
  'ch85': {
    title: 'Chapter 85 Quiz: Meaning of unsafe',
    questions: [
      {
        q: 'Which of the following is NOT one of the five things the unsafe keyword unlocks in Rust?',
        options: [
          'Dereferencing raw pointers',
          'Calling unsafe functions',
          'Disabling the borrow checker entirely',
          'Accessing fields of a union'
        ],
        answer: 2,
        explanation: 'unsafe unlocks exactly five capabilities. Disabling the borrow checker is not one of them — type checking, borrow checking, and all standard Rust rules still apply inside unsafe blocks. Only the five specific unsafe capabilities are unlocked.'
      },
      {
        q: 'A function is marked unsafe fn. What does this communicate to callers?',
        options: [
          'The function may panic or return an error in some cases',
          'The function is only available on unstable Rust',
          'The caller must uphold invariants the compiler cannot verify — calling it incorrectly causes undefined behavior',
          'The function bypasses Rust\'s type system and can accept any argument type'
        ],
        answer: 2,
        explanation: 'unsafe fn signals a contract: the caller is responsible for meeting preconditions (like "this pointer must be non-null") that Rust\'s type system cannot enforce. Breaking the contract results in undefined behavior.'
      },
      {
        q: 'Why must access to static mut variables be wrapped in unsafe?',
        options: [
          'Because global variables are slow and Rust wants to discourage their use',
          'Because multiple threads could read and write the variable simultaneously without synchronization, causing a data race',
          'Because static variables are stored in read-only memory and writing to them always crashes',
          'Because the borrow checker cannot track the lifetime of static variables'
        ],
        answer: 1,
        explanation: 'static mut variables are globally accessible. Without synchronization, two threads could race on reads and writes, which is a data race — undefined behavior. The unsafe requirement forces you to acknowledge and handle this risk.'
      },
      {
        q: 'You have a safe public function that contains one unsafe block inside it. From the caller\'s perspective, is the function safe to call?',
        options: [
          'No — any function containing unsafe is itself unsafe',
          'Yes — if the author correctly upheld the required invariants inside the unsafe block, the function is safe to call from safe Rust',
          'Only if the caller also wraps the call in an unsafe block',
          'It depends on whether the unsafe block dereferences a raw pointer or calls an extern function'
        ],
        answer: 1,
        explanation: 'A regular (non-unsafe) fn that contains an unsafe block is still safe to call. The author takes responsibility for the unsafe code inside. The caller does not need to know about or worry about the internal implementation.'
      },
      {
        q: 'What is the best practice for minimizing risk when writing unsafe code?',
        options: [
          'Wrap the entire module in one large unsafe block to keep the surface area simple',
          'Avoid SAFETY comments to keep the code concise',
          'Contain unsafe blocks to the smallest possible scope, add SAFETY comments explaining why each operation is valid, and expose a safe public API',
          'Only use unsafe in integration tests, never in production code'
        ],
        answer: 2,
        explanation: 'The smaller and more isolated the unsafe block, the easier it is to audit. SAFETY comments document the invariants being relied upon. A safe public API means users never write unsafe themselves, reducing the overall risk surface.'
      }
    ]
  },

  'ch86': {
    title: 'Chapter 86 Quiz: Raw Pointers',
    questions: [
      {
        q: 'What is the difference between *const T and *mut T in Rust?',
        options: [
          '*const T is on the stack; *mut T is on the heap',
          '*const T cannot be dereferenced; *mut T can be',
          '*const T is an immutable raw pointer (read-only); *mut T is a mutable raw pointer (read-write)',
          '*const T requires a lifetime annotation; *mut T does not'
        ],
        answer: 2,
        explanation: '*const T is an immutable raw pointer — you can read through it but not write. *mut T is a mutable raw pointer — you can both read and write. Neither has lifetime guarantees; both may be null, dangling, or misaligned.'
      },
      {
        q: 'Which operation on raw pointers requires an unsafe block?',
        options: [
          'Creating a raw pointer from a reference: `let p: *const i32 = &x;`',
          'Checking if a pointer is null: `p.is_null()`',
          'Dereferencing a raw pointer to read its value: `*p`',
          'Casting a raw pointer to a different pointer type: `p as *const u8`'
        ],
        answer: 2,
        explanation: 'Creating and casting raw pointers are safe operations — they don\'t access memory. Checking null is also safe. Dereferencing (*p) requires unsafe because the compiler cannot verify the pointer is valid, non-null, and correctly aligned.'
      },
      {
        q: 'What does ptr.add(n) do on a *const T?',
        options: [
          'Adds n bytes to the pointer address',
          'Advances the pointer by n elements of type T (n * size_of::<T>() bytes)',
          'Returns a new pointer offset by n bits',
          'Allocates n additional elements after the current pointer'
        ],
        answer: 1,
        explanation: 'add(n) performs pointer arithmetic in units of the pointed-to type T. If T is i32 (4 bytes) and n is 3, the address advances by 12 bytes. This is how you traverse arrays via raw pointers.'
      },
      {
        q: 'What does ptr::null::<i32>() return?',
        options: [
          'A pointer to a zero-initialized i32 on the heap',
          'A *const i32 with address 0 (a null pointer)',
          'An Option<*const i32> set to None',
          'A compile error — raw null pointers are not allowed in Rust'
        ],
        answer: 1,
        explanation: 'ptr::null() creates a typed null pointer — a *const T whose address is 0. It is safe to create and to call is_null() on, but dereferencing it is immediate undefined behavior.'
      },
      {
        q: 'A function returns a *const i32 pointing to a local variable. What happens when the caller dereferences this pointer?',
        options: [
          'Nothing — Rust ensures local variables live long enough for raw pointers',
          'The compiler rejects the code because returning raw pointers to locals is forbidden',
          'Undefined behavior: the local variable was freed when the function returned, leaving a dangling pointer',
          'The value is copied to the heap automatically before the function returns'
        ],
        answer: 2,
        explanation: 'Unlike references, raw pointers have no lifetime tracking. The local variable is destroyed when the function returns, but the raw pointer still holds the (now invalid) stack address. Dereferencing it reads freed memory — undefined behavior.'
      }
    ]
  },

  'ch87': {
    title: 'Chapter 87 Quiz: FFI with C/C++',
    questions: [
      {
        q: 'Why are calls to extern "C" functions always unsafe in Rust?',
        options: [
          'Because C functions are slower than Rust functions and may degrade performance',
          'Because Rust cannot verify that the C code is memory-safe or that the argument types match the actual C function signature',
          'Because the C calling convention is incompatible with Rust\'s type system',
          'Because extern functions might not be present at link time'
        ],
        answer: 1,
        explanation: 'Rust\'s safety guarantees come from its own compiler analysis. C code is opaque — the Rust compiler cannot verify that the C function respects memory safety. The caller must guarantee correct usage (right types, valid pointers, etc.).'
      },
      {
        q: 'What is the purpose of #[no_mangle] on a Rust function exported for C?',
        options: [
          'To prevent the function from being inlined by the optimizer',
          'To keep the function\'s symbol name unchanged in the compiled binary so C code can find it by name',
          'To mark the function as thread-safe for concurrent C callers',
          'To disable Rust\'s drop check for the function\'s return value'
        ],
        answer: 1,
        explanation: 'Rust normally "mangles" function names (encodes type information into the symbol) to support overloading. #[no_mangle] preserves the original name so that C code (which looks up functions by exact symbol name) can find and call it.'
      },
      {
        q: 'Why must you use CString instead of &str when passing a string to a C function?',
        options: [
          'Because C functions cannot accept UTF-8 encoded strings',
          'Because &str is not null-terminated. C string functions rely on a null byte (\\0) to find the end of the string. CString adds that null terminator.',
          'Because &str is stored on the stack and C cannot access stack memory',
          'Because Rust\'s &str uses a length prefix that confuses C parsers'
        ],
        answer: 1,
        explanation: 'C strings are null-terminated: the convention is to read bytes until reaching \'\\0\'. Rust\'s &str stores length separately and does not have a null terminator. CString::new() allocates a copy with a null terminator appended.'
      },
      {
        q: 'Which crate-type setting is required to build a Rust library that C code can link against dynamically?',
        options: [
          'crate-type = ["bin"]',
          'crate-type = ["rlib"]',
          'crate-type = ["cdylib"]',
          'crate-type = ["proc-macro"]'
        ],
        answer: 2,
        explanation: '"cdylib" produces a C-compatible dynamic library (.so on Linux, .dylib on macOS, .dll on Windows). "rlib" is Rust\'s internal library format that only other Rust crates can link against. "staticlib" produces a C-compatible static library.'
      },
      {
        q: 'You receive a *const c_char pointer from a C function and want to use its value in Rust. What is the correct approach?',
        options: [
          'Cast it directly to &str using `std::str::from_utf8_unchecked`',
          'Wrap it in CStr::from_ptr() (unsafe), then convert with to_str() or to_string_lossy() for a Rust string',
          'Dereference it directly to get a char and collect characters until null',
          'Pass it to String::from_raw_parts() with the known length'
        ],
        answer: 1,
        explanation: 'CStr::from_ptr() creates a &CStr from a *const c_char, which is unsafe because the caller must ensure the pointer is valid and null-terminated. Then to_str() (for valid UTF-8) or to_string_lossy() (for any bytes) converts it to Rust string types.'
      }
    ]
  },

  'ch88': {
    title: 'Chapter 88 Quiz: Writing Safe Wrappers',
    questions: [
      {
        q: 'What is the core principle of a safe wrapper in Rust?',
        options: [
          'Replace all unsafe operations with their safe equivalents inside the wrapper',
          'Contain unsafe code inside a struct or function, enforce invariants at the safe API boundary, and expose only safe public methods',
          'Use generics to make unsafe operations work with any type without requiring unsafe blocks',
          'Re-export unsafe functions with the unsafe keyword removed from their signature'
        ],
        answer: 1,
        explanation: 'Safe wrappers don\'t eliminate unsafe code — they isolate it. The author is responsible for verifying correctness inside the unsafe block. Users interact only with safe functions that maintain invariants, so they never write unsafe themselves.'
      },
      {
        q: 'Why should wrapper types that own raw memory always implement the Drop trait?',
        options: [
          'Because the compiler requires Drop for all types that contain raw pointers',
          'Because without Drop, the raw memory is never freed when the wrapper is dropped, causing a memory leak',
          'Because Drop allows the wrapper to be used with tokio::spawn',
          'Because Drop is needed to implement the Deref trait'
        ],
        answer: 1,
        explanation: 'When a wrapper is dropped, Rust calls its Drop::drop() implementation. Without this, the wrapper\'s destructor does nothing — heap memory allocated inside the wrapper is never freed. Every wrapper that owns raw memory must implement Drop to free it.'
      },
      {
        q: 'What is a SAFETY comment, and when is it required?',
        options: [
          'A doc comment on any public function explaining what it does',
          'A // SAFETY: comment before an unsafe block explaining why the operation is actually safe',
          'A #[safety] attribute that enables extra compiler checks for unsafe code',
          'A test function that verifies the unsafe code does not panic'
        ],
        answer: 1,
        explanation: 'SAFETY comments are the Rust ecosystem convention for documenting the invariants that make an unsafe block valid. They tell future readers (and auditors) exactly what conditions are being relied upon. They are not enforced by the compiler but are essential for maintainability.'
      },
      {
        q: 'You are wrapping a raw pointer in a struct. The pointer was created with Box::into_raw(). How should you free the memory in Drop?',
        options: [
          'Call std::alloc::dealloc() with a manually computed Layout',
          'Call std::mem::forget() on the pointer to prevent double-free',
          'Call Box::from_raw(self.ptr) to reconstruct the Box, which then frees memory when it drops',
          'Call std::ptr::drop_in_place() on the pointer'
        ],
        answer: 2,
        explanation: 'Box::from_raw() reconstructs a Box<T> from the raw pointer, transferring ownership back. When this Box is dropped at the end of the drop() function, the heap memory is freed. This is the correct counterpart to Box::into_raw().'
      },
      {
        q: 'What happens if a safe wrapper exposes a raw pointer field as pub?',
        options: [
          'The compiler automatically makes the field read-only to preserve safety',
          'External code can manipulate the pointer directly, potentially violating the invariants the wrapper was designed to maintain, breaking safety',
          'The pub field must be dereferenced inside an unsafe block, which is sufficient protection',
          'Nothing — raw pointers are always safe to expose as public fields'
        ],
        answer: 1,
        explanation: 'A public field means any code can read or modify it. If external code replaces the pointer with null or a dangling address, the wrapper\'s safe methods (which assume the pointer is valid) become unsound — they would trigger undefined behavior on the next dereference.'
      }
    ]
  },

  'ch89': {
    title: 'Chapter 89 Quiz: Manual Memory Management',
    questions: [
      {
        q: 'What does Box::into_raw(boxed) do?',
        options: [
          'Copies the boxed value to the stack and returns a stack pointer',
          'Transfers ownership of the heap allocation from the Box to a raw pointer, preventing the Box from freeing the memory on drop',
          'Leaks the memory permanently — it can never be freed after calling into_raw',
          'Creates a new allocation on the heap and copies the value into it'
        ],
        answer: 1,
        explanation: 'into_raw() "forgets" the Box — Rust will not free the memory when the Box goes out of scope. You receive a raw pointer and become responsible for eventually calling Box::from_raw() to free the memory.'
      },
      {
        q: 'You call std::alloc::alloc(layout) with a Layout for i32, but then call dealloc with a Layout for i64. What happens?',
        options: [
          'Rust detects the mismatch and returns an error at runtime',
          'The dealloc silently succeeds because both are power-of-two sizes',
          'Undefined behavior: the allocator\'s metadata is corrupted, likely causing crashes or memory corruption',
          'A compile error because the layout types don\'t match'
        ],
        answer: 2,
        explanation: 'The allocator relies on the Layout matching what was originally allocated. A mismatched size or alignment corrupts the allocator\'s internal bookkeeping, which is undefined behavior — it may crash immediately or cause subtle corruption that manifests later.'
      },
      {
        q: 'What is the difference between std::mem::forget(val) and ManuallyDrop::new(val)?',
        options: [
          'forget() prevents Drop from running AND prevents val from being used; ManuallyDrop lets you call drop() explicitly later',
          'forget() works only for primitive types; ManuallyDrop works for all types',
          'forget() leaks the value immediately; ManuallyDrop delays the leak to the next GC cycle',
          'There is no difference — they are aliases for the same function'
        ],
        answer: 0,
        explanation: 'mem::forget() is a one-way operation: the value is consumed and its destructor never runs. ManuallyDrop<T> wraps the value, prevents automatic dropping, but lets you access the inner value and call ManuallyDrop::drop() explicitly if and when you choose.'
      },
      {
        q: 'What does std::mem::size_of::<T>() return?',
        options: [
          'The number of fields in type T',
          'The number of bytes required to store a value of type T in memory',
          'The number of bytes allocated on the heap for a Box<T>',
          'The number of bits in the largest field of T'
        ],
        answer: 1,
        explanation: 'size_of::<T>() returns the size in bytes of T as it would be laid out in memory (including padding). This is the value you need when computing layouts for manual allocation or pointer arithmetic.'
      },
      {
        q: 'You pass a raw pointer to C via FFI, and C will call a Rust function to free it later. What must the Rust "free" function do?',
        options: [
          'Call std::mem::forget() on the pointer to ensure Rust does not double-free it',
          'Call Box::from_raw(ptr) to reconstruct the Box, which then drops and frees the heap memory',
          'Call std::alloc::dealloc() with Layout::new::<()>() as the layout',
          'Simply set the pointer to null — the allocator detects null and skips deallocation'
        ],
        answer: 1,
        explanation: 'If the memory was originally created with Box::into_raw(), the matching free operation is Box::from_raw(). This reconstructs the Box<T>, which then runs the destructor and frees the heap allocation when it falls out of scope at the end of the free function.'
      }
    ]
  }
});
