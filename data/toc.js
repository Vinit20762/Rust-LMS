/* Table of Contents data
   available: true  = chapter has content and is accessible
   available: false = coming soon, locked in sidebar
*/
const TOC = [
  {
    id: 1,
    title: 'Rust Setup & First Programs',
    subtitle: 'Fast Onboarding',
    available: true,
    chapters: [
      { id: 'ch01', num: 1,  title: 'Installing Rust (rustup, Toolchains)', available: true },
      { id: 'ch02', num: 2,  title: 'Cargo Basics',                          available: true },
      { id: 'ch03', num: 3,  title: 'Project Structure',                     available: true },
      { id: 'ch04', num: 4,  title: 'Hello World',                           available: true },
    ]
  },
  {
    id: 2,
    title: 'Core Language Basics',
    available: true,
    chapters: [
      { id: 'ch05', num: 5,  title: 'Variables, Mutability & Shadowing',     available: true  },
      { id: 'ch06', num: 6,  title: 'Primitive Types',                       available: true  },
      { id: 'ch07', num: 7,  title: 'Expressions vs Statements',             available: true  },
      { id: 'ch08', num: 8,  title: 'Control Flow (if, loop, while, for)',   available: true  },
      { id: 'ch09', num: 9,  title: 'Functions',                             available: true  },
      { id: 'ch10', num: 10, title: 'Pattern Matching Basics',               available: true  },
      { id: 'ch11', num: 11, title: 'Basic Input/Output',                    available: true  },
    ]
  },
  {
    id: 3,
    title: 'Structs, Enums & Data Modeling',
    available: true,
    chapters: [
      { id: 'ch12', num: 12, title: 'Structs & Methods',                     available: true  },
      { id: 'ch13', num: 13, title: 'Associated Functions',                  available: true  },
      { id: 'ch14', num: 14, title: 'Enums & Option',                        available: true  },
      { id: 'ch15', num: 15, title: 'Match Expressions',                     available: true  },
      { id: 'ch16', num: 16, title: 'Pattern Destructuring',                 available: true  },
      { id: 'ch17', num: 17, title: 'Designing Custom Data Types',           available: true  },
    ]
  },
  {
    id: 4,
    title: 'Ownership & Borrowing',
    subtitle: 'The Foundation',
    available: true,
    chapters: [
      { id: 'ch18', num: 18, title: 'Stack vs Heap',                         available: true  },
      { id: 'ch19', num: 19, title: 'Move Semantics',                        available: true  },
      { id: 'ch20', num: 20, title: 'Ownership Rules',                       available: true  },
      { id: 'ch21', num: 21, title: 'References',                            available: false },
      { id: 'ch22', num: 22, title: 'Mutable vs Immutable Borrow',           available: false },
      { id: 'ch23', num: 23, title: 'Dangling References',                   available: false },
      { id: 'ch24', num: 24, title: 'Slices',                                available: false },
      { id: 'ch25', num: 25, title: 'Borrow Checker Errors',                 available: false },
      { id: 'ch26', num: 26, title: 'Interior Mutability (Cell, RefCell)',   available: false },
    ]
  },
  {
    id: 5,
    title: 'Lifetimes & Memory Safety',
    available: false,
    chapters: [
      { id: 'ch27', num: 27, title: 'Lifetime Annotations',                  available: false },
      { id: 'ch28', num: 28, title: 'Lifetime Elision Rules',                available: false },
      { id: 'ch29', num: 29, title: 'Lifetimes in Structs',                  available: false },
      { id: 'ch30', num: 30, title: "The 'static Lifetime",                  available: false },
      { id: 'ch31', num: 31, title: 'Designing Lifetime-Safe APIs',          available: false },
      { id: 'ch32', num: 32, title: 'Debugging Lifetime Errors',             available: false },
    ]
  },
  {
    id: 6,
    title: 'Collections & Error Handling',
    available: false,
    chapters: [
      { id: 'ch33', num: 33, title: 'Vec&lt;T&gt;',                          available: false },
      { id: 'ch34', num: 34, title: 'String',                                available: false },
      { id: 'ch35', num: 35, title: 'HashMap&lt;K, V&gt;',                   available: false },
      { id: 'ch36', num: 36, title: 'Result&lt;T, E&gt;',                    available: false },
      { id: 'ch37', num: 37, title: 'Option&lt;T&gt;',                       available: false },
      { id: 'ch38', num: 38, title: 'Error Propagation (?)',                 available: false },
      { id: 'ch39', num: 39, title: 'Custom Error Types',                    available: false },
      { id: 'ch40', num: 40, title: 'Panic Strategy',                        available: false },
    ]
  },
  {
    id: 7,
    title: 'Traits, Generics & Type System',
    available: false,
    chapters: [
      { id: 'ch41', num: 41, title: 'Generics',                              available: false },
      { id: 'ch42', num: 42, title: 'Trait Definitions',                     available: false },
      { id: 'ch43', num: 43, title: 'Trait Bounds',                          available: false },
      { id: 'ch44', num: 44, title: 'Associated Types',                      available: false },
      { id: 'ch45', num: 45, title: 'Trait Objects',                         available: false },
      { id: 'ch46', num: 46, title: 'Static vs Dynamic Dispatch',            available: false },
      { id: 'ch47', num: 47, title: 'Operator Overloading',                  available: false },
    ]
  },
  {
    id: 8,
    title: 'Iterators, Closures & Functional Rust',
    available: false,
    chapters: [
      { id: 'ch48', num: 48, title: 'Closures',                              available: false },
      { id: 'ch49', num: 49, title: 'Iterators',                             available: false },
      { id: 'ch50', num: 50, title: 'map, filter, fold',                     available: false },
      { id: 'ch51', num: 51, title: 'Lazy Evaluation',                       available: false },
      { id: 'ch52', num: 52, title: 'Higher-Order Functions',                available: false },
      { id: 'ch53', num: 53, title: 'Writing Iterator Adapters',             available: false },
    ]
  },
  {
    id: 9,
    title: 'Modules, Crates & API Design',
    available: false,
    chapters: [
      { id: 'ch54', num: 54, title: 'Modules & Visibility',                  available: false },
      { id: 'ch55', num: 55, title: 'Crate Architecture',                    available: false },
      { id: 'ch56', num: 56, title: 'Workspaces',                            available: false },
      { id: 'ch57', num: 57, title: 'Library Design',                        available: false },
      { id: 'ch58', num: 58, title: 'Idiomatic Rust Patterns',               available: false },
      { id: 'ch59', num: 59, title: 'Public API Design Principles',          available: false },
      { id: 'ch60', num: 60, title: 'Documentation & rustdoc',               available: false },
      { id: 'ch61', num: 61, title: 'Testing',                               available: false },
    ]
  },
  {
    id: 10,
    title: 'Smart Pointers & Advanced Types',
    available: false,
    chapters: [
      { id: 'ch62', num: 62, title: 'Box&lt;T&gt;',                          available: false },
      { id: 'ch63', num: 63, title: 'Rc&lt;T&gt;',                           available: false },
      { id: 'ch64', num: 64, title: 'Arc&lt;T&gt;',                          available: false },
      { id: 'ch65', num: 65, title: 'Weak&lt;T&gt;',                         available: false },
      { id: 'ch66', num: 66, title: 'Deref & Drop',                          available: false },
      { id: 'ch67', num: 67, title: 'Send & Sync',                           available: false },
      { id: 'ch68', num: 68, title: 'Newtype Pattern',                       available: false },
      { id: 'ch69', num: 69, title: 'Phantom Types',                         available: false },
    ]
  },
  {
    id: 11,
    title: 'Concurrency & Multithreading',
    available: false,
    chapters: [
      { id: 'ch70', num: 70, title: 'Threads',                               available: false },
      { id: 'ch71', num: 71, title: 'Channels',                              available: false },
      { id: 'ch72', num: 72, title: 'Mutex & RwLock',                        available: false },
      { id: 'ch73', num: 73, title: 'Deadlocks',                             available: false },
      { id: 'ch74', num: 74, title: 'Atomics',                               available: false },
      { id: 'ch75', num: 75, title: 'Lock-Free Basics',                      available: false },
      { id: 'ch76', num: 76, title: 'Fearless Concurrency',                  available: false },
    ]
  },
  {
    id: 12,
    title: 'Async Programming & Tokio',
    subtitle: 'Industry Critical',
    available: false,
    chapters: [
      { id: 'ch77', num: 77, title: 'Futures',                               available: false },
      { id: 'ch78', num: 78, title: 'async/await',                           available: false },
      { id: 'ch79', num: 79, title: 'Executors',                             available: false },
      { id: 'ch80', num: 80, title: 'Tokio Runtime',                         available: false },
      { id: 'ch81', num: 81, title: 'Async TCP Server',                      available: false },
      { id: 'ch82', num: 82, title: 'Async HTTP Server',                     available: false },
      { id: 'ch83', num: 83, title: 'select! and join!',                     available: false },
      { id: 'ch84', num: 84, title: 'Cancellation & Backpressure',           available: false },
    ]
  },
  {
    id: 13,
    title: 'Unsafe Rust & FFI',
    available: false,
    chapters: [
      { id: 'ch85', num: 85, title: 'Meaning of unsafe',                     available: false },
      { id: 'ch86', num: 86, title: 'Raw Pointers',                          available: false },
      { id: 'ch87', num: 87, title: 'FFI with C/C++',                        available: false },
      { id: 'ch88', num: 88, title: 'Writing Safe Wrappers',                 available: false },
      { id: 'ch89', num: 89, title: 'Manual Memory Management',              available: false },
    ]
  },
  {
    id: 14,
    title: 'Macros & Metaprogramming',
    available: false,
    chapters: [
      { id: 'ch90', num: 90, title: 'macro_rules!',                          available: false },
      { id: 'ch91', num: 91, title: 'Derive Macros',                         available: false },
      { id: 'ch92', num: 92, title: 'Attribute Macros',                      available: false },
      { id: 'ch93', num: 93, title: 'Procedural Macros',                     available: false },
      { id: 'ch94', num: 94, title: 'Building Custom Derive',                available: false },
    ]
  },
  {
    id: 15,
    title: 'Performance Engineering',
    available: false,
    chapters: [
      { id: 'ch95',  num: 95,  title: 'Zero-Cost Abstractions',              available: false },
      { id: 'ch96',  num: 96,  title: 'Memory Layout',                       available: false },
      { id: 'ch97',  num: 97,  title: 'Cache Locality',                      available: false },
      { id: 'ch98',  num: 98,  title: 'Benchmarking',                        available: false },
      { id: 'ch99',  num: 99,  title: 'Profiling (Flamegraph)',               available: false },
      { id: 'ch100', num: 100, title: 'Optimization Strategies',             available: false },
    ]
  },
];

/* Flat ordered list of available chapter IDs for prev/next navigation */
const CHAPTER_ORDER = TOC.flatMap(m => m.chapters.filter(c => c.available).map(c => c.id));

/* Global content stores — module files extend these with Object.assign() */
const CHAPTERS_CONTENT = {};
const QUIZZES = {};
