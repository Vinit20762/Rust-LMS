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
      { id: 'ch21', num: 21, title: 'References',                            available: true  },
      { id: 'ch22', num: 22, title: 'Mutable vs Immutable Borrow',           available: true  },
      { id: 'ch23', num: 23, title: 'Dangling References',                   available: true  },
      { id: 'ch24', num: 24, title: 'Slices',                                available: true  },
      { id: 'ch25', num: 25, title: 'Borrow Checker Errors',                 available: true  },
      { id: 'ch26', num: 26, title: 'Interior Mutability (Cell, RefCell)',   available: true  },
    ]
  },
  {
    id: 5,
    title: 'Lifetimes & Memory Safety',
    available: true,
    chapters: [
      { id: 'ch27', num: 27, title: 'Lifetime Annotations',                  available: true  },
      { id: 'ch28', num: 28, title: 'Lifetime Elision Rules',                available: true  },
      { id: 'ch29', num: 29, title: 'Lifetimes in Structs',                  available: true  },
      { id: 'ch30', num: 30, title: "The 'static Lifetime",                  available: true  },
      { id: 'ch31', num: 31, title: 'Designing Lifetime-Safe APIs',          available: true  },
      { id: 'ch32', num: 32, title: 'Debugging Lifetime Errors',             available: true  },
    ]
  },
  {
    id: 6,
    title: 'Collections & Error Handling',
    available: true,
    chapters: [
      { id: 'ch33', num: 33, title: 'Vec&lt;T&gt;',                          available: true  },
      { id: 'ch34', num: 34, title: 'String',                                available: true  },
      { id: 'ch35', num: 35, title: 'HashMap&lt;K, V&gt;',                   available: true  },
      { id: 'ch36', num: 36, title: 'Result&lt;T, E&gt;',                    available: true  },
      { id: 'ch37', num: 37, title: 'Option&lt;T&gt;',                       available: true  },
      { id: 'ch38', num: 38, title: 'Error Propagation (?)',                 available: true  },
      { id: 'ch39', num: 39, title: 'Custom Error Types',                    available: true  },
      { id: 'ch40', num: 40, title: 'Panic Strategy',                        available: true  },
    ]
  },
  {
    id: 7,
    title: 'Traits, Generics & Type System',
    available: true,
    chapters: [
      { id: 'ch41', num: 41, title: 'Generics',                              available: true  },
      { id: 'ch42', num: 42, title: 'Trait Definitions',                     available: true  },
      { id: 'ch43', num: 43, title: 'Trait Bounds',                          available: true  },
      { id: 'ch44', num: 44, title: 'Associated Types',                      available: true  },
      { id: 'ch45', num: 45, title: 'Trait Objects',                         available: true  },
      { id: 'ch46', num: 46, title: 'Static vs Dynamic Dispatch',            available: true  },
      { id: 'ch47', num: 47, title: 'Operator Overloading',                  available: true  },
    ]
  },
  {
    id: 8,
    title: 'Iterators, Closures & Functional Rust',
    available: true,
    chapters: [
      { id: 'ch48', num: 48, title: 'Closures',                              available: true  },
      { id: 'ch49', num: 49, title: 'Iterators',                             available: true  },
      { id: 'ch50', num: 50, title: 'map, filter, fold',                     available: true  },
      { id: 'ch51', num: 51, title: 'Lazy Evaluation',                       available: true  },
      { id: 'ch52', num: 52, title: 'Higher-Order Functions',                available: true  },
      { id: 'ch53', num: 53, title: 'Writing Iterator Adapters',             available: true  },
    ]
  },
  {
    id: 9,
    title: 'Modules, Crates & API Design',
    available: true,
    chapters: [
      { id: 'ch54', num: 54, title: 'Modules & Visibility',                  available: true  },
      { id: 'ch55', num: 55, title: 'Crate Architecture',                    available: true  },
      { id: 'ch56', num: 56, title: 'Workspaces',                            available: true  },
      { id: 'ch57', num: 57, title: 'Library Design',                        available: true  },
      { id: 'ch58', num: 58, title: 'Idiomatic Rust Patterns',               available: true  },
      { id: 'ch59', num: 59, title: 'Public API Design Principles',          available: true  },
      { id: 'ch60', num: 60, title: 'Documentation & rustdoc',               available: true  },
      { id: 'ch61', num: 61, title: 'Testing',                               available: true  },
    ]
  },
  {
    id: 10,
    title: 'Smart Pointers & Advanced Types',
    available: true,
    chapters: [
      { id: 'ch62', num: 62, title: 'Box&lt;T&gt;',                          available: true  },
      { id: 'ch63', num: 63, title: 'Rc&lt;T&gt;',                           available: true  },
      { id: 'ch64', num: 64, title: 'Arc&lt;T&gt;',                          available: true  },
      { id: 'ch65', num: 65, title: 'Weak&lt;T&gt;',                         available: true  },
      { id: 'ch66', num: 66, title: 'Deref &amp; Drop',                      available: true  },
      { id: 'ch67', num: 67, title: 'Send &amp; Sync',                       available: true  },
      { id: 'ch68', num: 68, title: 'Newtype Pattern',                       available: true  },
      { id: 'ch69', num: 69, title: 'Phantom Types',                         available: true  },
    ]
  },
  {
    id: 11,
    title: 'Concurrency & Multithreading',
    available: true,
    chapters: [
      { id: 'ch70', num: 70, title: 'Threads',                               available: true  },
      { id: 'ch71', num: 71, title: 'Channels',                              available: true  },
      { id: 'ch72', num: 72, title: 'Mutex & RwLock',                        available: true  },
      { id: 'ch73', num: 73, title: 'Deadlocks',                             available: true  },
      { id: 'ch74', num: 74, title: 'Atomics',                               available: true  },
      { id: 'ch75', num: 75, title: 'Lock-Free Basics',                      available: true  },
      { id: 'ch76', num: 76, title: 'Fearless Concurrency',                  available: true  },
    ]
  },
  {
    id: 12,
    title: 'Async Programming & Tokio',
    subtitle: 'Industry Critical',
    available: true,
    chapters: [
      { id: 'ch77', num: 77, title: 'Futures',                               available: true  },
      { id: 'ch78', num: 78, title: 'async/await',                           available: true  },
      { id: 'ch79', num: 79, title: 'Executors',                             available: true  },
      { id: 'ch80', num: 80, title: 'Tokio Runtime',                         available: true  },
      { id: 'ch81', num: 81, title: 'Async TCP Server',                      available: true  },
      { id: 'ch82', num: 82, title: 'Async HTTP Server',                     available: true  },
      { id: 'ch83', num: 83, title: 'select! and join!',                     available: true  },
      { id: 'ch84', num: 84, title: 'Cancellation & Backpressure',           available: true  },
    ]
  },
  {
    id: 13,
    title: 'Unsafe Rust & FFI',
    available: true,
    chapters: [
      { id: 'ch85', num: 85, title: 'Meaning of unsafe',                     available: true  },
      { id: 'ch86', num: 86, title: 'Raw Pointers',                          available: true  },
      { id: 'ch87', num: 87, title: 'FFI with C/C++',                        available: true  },
      { id: 'ch88', num: 88, title: 'Writing Safe Wrappers',                 available: true  },
      { id: 'ch89', num: 89, title: 'Manual Memory Management',              available: true  },
    ]
  },
  {
    id: 14,
    title: 'Macros & Metaprogramming',
    available: true,
    chapters: [
      { id: 'ch90', num: 90, title: 'macro_rules!',                          available: true  },
      { id: 'ch91', num: 91, title: 'Derive Macros',                         available: true  },
      { id: 'ch92', num: 92, title: 'Attribute Macros',                      available: true  },
      { id: 'ch93', num: 93, title: 'Procedural Macros',                     available: true  },
      { id: 'ch94', num: 94, title: 'Building Custom Derive',                available: true  },
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
