Object.assign(QUIZZES, {
  'ch90': {
    title: 'Chapter 90 Quiz: macro_rules!',
    questions: [
      {
        q: 'In a macro_rules! pattern, what does $name:expr mean?',
        options: [
          'A variable called $name that must match a specific expression literal',
          'A metavariable called $name that captures any Rust expression',
          'A type parameter named expr that is bound to $name',
          'A required keyword argument that must be named "expr"'
        ],
        answer: 1,
        explanation: '$name is the metavariable name you choose. The fragment specifier after the colon (here: expr) tells the macro what kind of syntax token to accept. "expr" matches any valid Rust expression.'
      },
      {
        q: 'Which fragment specifier should you use to match a variable or function name (an identifier)?',
        options: [
          'expr',
          'literal',
          'ident',
          'tt'
        ],
        answer: 2,
        explanation: '"ident" matches a Rust identifier: a variable name, function name, struct name, etc. "expr" matches full expressions. Using "expr" for a binding name in let statements causes a compile error because the compiler expects an identifier pattern, not an arbitrary expression.'
      },
      {
        q: 'What does the $(...),* syntax do in a macro_rules! pattern?',
        options: [
          'It matches a single optional item followed by a comma',
          'It matches a comma-separated sequence of zero or more items',
          'It creates a comma-delimited list in the macro output only',
          'It is a comment syntax inside macro definitions'
        ],
        answer: 1,
        explanation: '$(...),* is the repetition syntax. The pattern inside $(...) is matched repeatedly, separated by commas, zero or more times. The corresponding $(...),* in the expansion repeats the output code once per matched item.'
      },
      {
        q: 'You write a macro that should return a value from a block. Which expansion is correct?',
        options: [
          '`($x:expr) => { let r = $x * 2; r };`',
          '`($x:expr) => {{ let r = $x * 2; r }};`',
          '`($x:expr) => (let r = $x * 2; r);`',
          '`($x:expr) => return $x * 2;`'
        ],
        answer: 1,
        explanation: 'The outer braces {} are part of the macro syntax (the arm body delimiter). To make a Rust block that evaluates to a value, you need inner braces too: {{ ... }}. The double braces produce a single Rust block expression that can yield the last expression as its value.'
      },
      {
        q: 'What does the stringify!($x) macro produce when $x is the expression 2 + 3?',
        options: [
          'The integer 5',
          'The string "5"',
          'The string "2 + 3"',
          'A compile-time error because expressions cannot be stringified'
        ],
        answer: 2,
        explanation: 'stringify! converts its argument\'s source text to a string literal at compile time, before evaluation. stringify!(2 + 3) produces the string "2 + 3", not "5". This is useful for logging the original expression text alongside its computed value.'
      }
    ]
  },

  'ch91': {
    title: 'Chapter 91 Quiz: Derive Macros',
    questions: [
      {
        q: 'What does #[derive(Debug)] generate for a struct?',
        options: [
          'A display() method that prints the struct to stdout',
          'An implementation of the fmt::Debug trait, enabling {:?} and {:#?} formatting',
          'A debug_assert! call that validates the struct on every use',
          'A unit test that checks the struct can be created without panicking'
        ],
        answer: 1,
        explanation: 'Deriving Debug generates impl fmt::Debug for YourStruct, which allows the struct to be printed with {:?} (compact) and {:#?} (pretty-printed) format specifiers. Every field must also implement Debug.'
      },
      {
        q: 'A struct has a field of type Vec<String>. Which traits can it derive?',
        options: [
          'Debug, Clone, Copy, PartialEq',
          'Debug, Clone, PartialEq (but NOT Copy)',
          'Debug only — Vec does not support any derives',
          'None — types containing Vec cannot use #[derive]'
        ],
        answer: 1,
        explanation: 'Vec<String> implements Debug, Clone, and PartialEq, so those derives work. But Vec<T> is not Copy (it owns heap memory that cannot be bitwise-copied safely), so a struct containing Vec cannot derive Copy either.'
      },
      {
        q: 'What is required to derive Ord on a struct?',
        options: [
          'Only PartialOrd needs to also be derived',
          'PartialEq, Eq, and PartialOrd must all also be derived (or manually implemented)',
          'Nothing else — Ord can be derived independently',
          'The struct must also derive Hash and Default'
        ],
        answer: 1,
        explanation: 'Ord has a supertrait chain: Ord requires Eq + PartialOrd, Eq requires PartialEq, and PartialOrd requires PartialEq. All of these must be available (derived or manually implemented) for Ord to compile.'
      },
      {
        q: 'What does the struct update syntax ..Default::default() do when Default is derived?',
        options: [
          'It calls the Default implementation and merges its fields with the ones you specified',
          'It resets the entire struct to its default values, discarding any fields you wrote above it',
          'It is syntax sugar for calling Default::default() and assigning to the variable',
          'It only works with primitive field types'
        ],
        answer: 0,
        explanation: '..Default::default() fills in any fields not explicitly listed with their default values. Fields you specify explicitly override the defaults. This pattern is commonly used to configure structs with many optional settings.'
      },
      {
        q: 'To use a custom struct as a key in a HashMap, which traits must it implement?',
        options: [
          'Clone and Debug',
          'PartialEq, Eq, and Hash',
          'Ord and Hash',
          'Display and Hash'
        ],
        answer: 1,
        explanation: 'HashMap<K, V> requires K: Eq + Hash. Eq requires PartialEq. All three can be derived together with #[derive(PartialEq, Eq, Hash)] as long as all fields also implement those traits.'
      }
    ]
  },

  'ch92': {
    title: 'Chapter 92 Quiz: Attribute Macros',
    questions: [
      {
        q: 'What is the key difference between a derive macro and an attribute macro?',
        options: [
          'Derive macros generate faster code; attribute macros generate safer code',
          'Derive macros add new impl blocks alongside the original item; attribute macros replace the entire item with whatever they return',
          'Derive macros work on structs only; attribute macros work on functions only',
          'Derive macros are built into the compiler; attribute macros must be downloaded from crates.io'
        ],
        answer: 1,
        explanation: '#[derive(Trait)] keeps the original struct/enum and adds new impl blocks beside it. An attribute macro #[my_attr] receives the item and returns a completely new TokenStream — the original item is gone unless the macro explicitly includes it in the output.'
      },
      {
        q: 'An attribute macro function receives two TokenStream arguments. What does each represent?',
        options: [
          'The first is the crate name; the second is the module path',
          'The first is the arguments inside the attribute parentheses; the second is the item the attribute is attached to',
          'The first is the original item; the second is the previous attribute in the attribute stack',
          'The first is the attribute name; the second is the item\'s fields'
        ],
        answer: 1,
        explanation: 'An attribute macro is declared as fn(args: TokenStream, item: TokenStream) -> TokenStream. "args" is everything inside the attribute\'s parentheses (e.g., for #[timeout(5)], args is "5"). "item" is the complete function, struct, or other item being decorated.'
      },
      {
        q: 'Why must attribute macros be defined in a separate crate with proc-macro = true?',
        options: [
          'For performance: proc macros run at compile time and must be pre-compiled separately',
          'Because attribute macros require special memory allocation that only the proc-macro runtime provides',
          'Because they use proc_macro::TokenStream, which is a special type only available in proc-macro crates, and the compiler needs to compile and run them before compiling the code that uses them',
          'Because attribute macros generate unsafe code and must be isolated for security'
        ],
        answer: 2,
        explanation: 'proc_macro::TokenStream is only available in crates with proc-macro = true. More importantly, the compiler runs these macros during compilation of the code that uses them, so they must be compiled first as a separate binary that the compiler can execute.'
      },
      {
        q: 'What does the built-in #[cfg(test)] attribute do?',
        options: [
          'It marks a function as a performance test to be benchmarked',
          'It includes the annotated item only when the crate is compiled in test mode (cargo test)',
          'It generates a test harness for the annotated struct automatically',
          'It disables optimizations for the annotated function so tests run predictably'
        ],
        answer: 1,
        explanation: '#[cfg(test)] is a conditional compilation attribute. The annotated item (usually a test module) is only included in the binary when running cargo test. This keeps test code out of release builds.'
      },
      {
        q: 'An attribute macro is supposed to wrap a function with logging. The implementation returns TokenStream::new(). What happens to the decorated function?',
        options: [
          'The function is preserved and an empty logging wrapper is generated alongside it',
          'The function is completely replaced by an empty token stream — it ceases to exist in the compiled code',
          'The compiler falls back to the original function definition',
          'A runtime error occurs when the missing function is called'
        ],
        answer: 1,
        explanation: 'Attribute macros replace the item entirely. Whatever the macro returns IS the new code. Returning TokenStream::new() means the original function is replaced with nothing — a compile error if anything tries to call it.'
      }
    ]
  },

  'ch93': {
    title: 'Chapter 93 Quiz: Procedural Macros',
    questions: [
      {
        q: 'What is a TokenStream in the context of procedural macros?',
        options: [
          'A runtime stream of bytes for network communication between macro processes',
          'A compile-time sequence of syntax tokens representing Rust source code, which proc macros receive as input and return as output',
          'A buffered reader that streams tokens from a .rs file on disk',
          'An iterator over the characters of a string containing Rust code'
        ],
        answer: 1,
        explanation: 'A TokenStream is an opaque sequence of tokens (identifiers, keywords, punctuation, literals, groups) representing Rust syntax. Proc macros receive their input as TokenStream and must return a TokenStream that the compiler compiles in place of the macro invocation.'
      },
      {
        q: 'Which Cargo.toml setting is required to make a crate a proc-macro crate?',
        options: [
          '[package] macro = true',
          '[lib] proc-macro = true',
          '[features] procedural = true',
          '[profile.build] macro-crate = true'
        ],
        answer: 1,
        explanation: 'Setting proc-macro = true under [lib] in Cargo.toml designates the crate as a procedural macro crate. This unlocks the proc_macro crate as a dependency and restricts the crate to only exporting proc macro functions.'
      },
      {
        q: 'What is the purpose of the syn crate in proc macro development?',
        options: [
          'It generates TokenStream output from Rust-like templates',
          'It provides synchronization primitives for multi-threaded macro evaluation',
          'It parses a TokenStream into a structured Rust syntax tree (AST) that you can inspect and traverse programmatically',
          'It synchronizes macro state across compilation units in a workspace'
        ],
        answer: 2,
        explanation: 'syn parses raw TokenStream input into typed Rust AST nodes like DeriveInput, ItemFn, Expr, etc. Instead of working with raw tokens, you can access the struct name, field names, types, and attributes as structured Rust data.'
      },
      {
        q: 'What is the purpose of the quote! macro from the quote crate?',
        options: [
          'It converts Rust strings into quoted string literals',
          'It generates a TokenStream from a Rust-like code template, with #variable interpolation for inserting runtime values into the generated code',
          'It quotes a TokenStream to prevent it from being evaluated during macro expansion',
          'It formats Rust code as a human-readable string for error messages'
        ],
        answer: 1,
        explanation: 'quote! takes a quasi-Rust template and produces a TokenStream. You interpolate Rust values (like syn identifier nodes or string literals) using #variable syntax. quote! is the counterpart to syn: syn reads code, quote! writes code.'
      },
      {
        q: 'You want to write a macro invoked as `sql!(SELECT * FROM users)`. Which kind of proc macro should you use?',
        options: [
          'A derive macro: #[derive(sql)]',
          'An attribute macro: #[sql]',
          'A function-like proc macro: marked with #[proc_macro]',
          'A declarative macro_rules! macro'
        ],
        answer: 2,
        explanation: 'Function-like proc macros are invoked with the ! syntax: my_macro!(input). They are defined with #[proc_macro]. This is the right type for macros like sql!(...), html!(...), or regex!(...) that take arbitrary token input and transform it.'
      }
    ]
  },

  'ch94': {
    title: 'Chapter 94 Quiz: Building Custom Derive',
    questions: [
      {
        q: 'In a custom derive macro, what does parse_macro_input!(input as DeriveInput) return?',
        options: [
          'A String containing the source code of the struct',
          'A syn::DeriveInput: a structured AST representing the struct or enum the macro is attached to',
          'A Vec<TokenStream> containing each field of the struct separately',
          'A proc_macro2::TokenStream that can be directly returned from the macro'
        ],
        answer: 1,
        explanation: 'parse_macro_input! parses the raw TokenStream using syn and returns a syn::DeriveInput — a typed AST node. DeriveInput has fields like ident (the name), data (struct/enum body), attrs (attributes), and generics.'
      },
      {
        q: 'In the quote! macro, what does #(self.#fields),* generate when fields is a Vec of identifiers [x, y]?',
        options: [
          'The literal text "#fields"',
          'self.x, self.y (each field access separated by commas)',
          'A loop over the fields at runtime',
          'A single expression: self.[x, y]'
        ],
        answer: 1,
        explanation: '#(...)* is quote!\'s repetition syntax. It expands the pattern inside once per item in the iterator. #(self.#fields),* with fields = [x, y] generates: self.x, self.y — field accesses separated by commas.'
      },
      {
        q: 'What is the correct way to emit a compiler error from a proc macro that points to a specific piece of code?',
        options: [
          'panic!("error message") — panics in proc macros become compiler errors',
          'Return an empty TokenStream::new() — the compiler infers the error location',
          'Use syn::Error::new_spanned(token, "message").to_compile_error().into() to return a proper compile error with a span',
          'Call std::process::exit(1) to terminate compilation'
        ],
        answer: 2,
        explanation: 'syn::Error::new_spanned() creates an error attached to a specific token (which determines where the error arrow points in the compiler output). .to_compile_error() converts it to a TokenStream that the compiler interprets as a compile_error!() call, showing the message at the right location.'
      },
      {
        q: 'A custom derive macro is defined in crate "my-derive". How must the application crate declare it?',
        options: [
          'It is automatically available if both crates are in the same workspace',
          'Add my-derive as a dependency in Cargo.toml AND use the specific derive in a use statement or directly',
          'Add a #![register_derive] attribute at the top of the application crate\'s main.rs',
          'Copy the macro definition into the application crate\'s build.rs'
        ],
        answer: 1,
        explanation: 'Proc macros are not automatically available. You must list the macro crate as a [dependency] in Cargo.toml and import the macro with `use my_derive::MyMacroName;` in the Rust file that uses it.'
      },
      {
        q: 'Your custom derive should also accept a #[skip] attribute on individual fields to exclude them. How do you declare this support?',
        options: [
          '#[proc_macro_derive(MyTrait, attributes(skip))]',
          '#[proc_macro_derive(MyTrait)] #[helper_attribute(skip)]',
          '#[proc_macro_derive(MyTrait, helpers = ["skip"])]',
          'No declaration is needed — any attribute can be read by any derive macro'
        ],
        answer: 0,
        explanation: 'The attributes(...) argument in #[proc_macro_derive] registers helper attributes that the derive macro handles. Without this declaration, the compiler would reject #[skip] on a field as an unknown attribute, even if your macro code reads and handles it.'
      }
    ]
  }
});
