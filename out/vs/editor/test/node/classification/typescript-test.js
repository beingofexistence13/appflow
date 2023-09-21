"use strict";
///
/* eslint-disable */
const x01 = "string";
///         ^^^^^^^^ string
const x02 = '\'';
///         ^^^^ string
const x03 = '\n\'\t';
///         ^^^^^^^^ string
const x04 = 'this is\
///         ^^^^^^^^^ string\
a multiline string';
/// <------------------- string
const x05 = x01; // just some text
///             ^^^^^^^^^^^^^^^^^ comment
const x06 = x05; /* multi
///             ^^^^^^^^ comment
line *comment */
/// <---------------- comment
const x07 = 4 / 5;
const x08 = `howdy`;
///         ^^^^^^^ string
const x09 = `\'\"\``;
///         ^^^^^^^^ string
const x10 = `$[]`;
///         ^^^^^ string
const x11 = `${x07 + /**/ 3}px`;
///         ^^^ string
///                 ^^^^ comment
///                      ^^^^ string
const x12 = `${x07 + (function () { return 5; })() /**/}px`;
///         ^^^ string
///                                               ^^^^ comment
///                                                   ^^^^ string
const x13 = /([\w\-]+)?(#([\w\-]+))?((.([\w\-]+))*)/;
///         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ regex
const x14 = /\./g;
///         ^^^^^ regex
const x15 = Math.abs(x07) / x07; // speed
///                              ^^^^^^^^ comment
const x16 = / x07; /.test('3');
///         ^^^^^^^^ regex
///                       ^^^ string
const x17 = `.monaco-dialog-modal-block${true ? '.dimmed' : ''}`;
///         ^^^^^^^^^^^^^^^^^^^^^^ string
///                                      ^^^^^^^^^ string
///                                                  ^^^^ string
const x18 = Math.min((14 <= 0.5 ? 123 / (2 * 1) : ''.length / (2 - (2 * 1))), 1);
///                                               ^^ string
const x19 = `${3 / '5'.length} km/h)`;
///         ^^^ string
///                ^^^ string
///                          ^^^^^^^ string
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC10ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3Rlc3Qvbm9kZS9jbGFzc2lmaWNhdGlvbi90eXBlc2NyaXB0LXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLEdBQUc7QUFDSCxvQkFBb0I7QUFDcEIsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDO0FBQ3JCLDJCQUEyQjtBQUUzQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUM7QUFDakIsdUJBQXVCO0FBRXZCLE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQztBQUNyQiwyQkFBMkI7QUFFM0IsTUFBTSxHQUFHLEdBQUc7O21CQUVPLENBQUM7QUFDcEIsK0JBQStCO0FBRS9CLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBLGlCQUFpQjtBQUNqQyx5Q0FBeUM7QUFFekMsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7O2dCQUVBO0FBQ2hCLDZCQUE2QjtBQUU3QixNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBRWxCLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQztBQUNwQiwwQkFBMEI7QUFFMUIsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDO0FBQ3JCLDJCQUEyQjtBQUUzQixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUM7QUFDbEIsd0JBQXdCO0FBRXhCLE1BQU0sR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFFLElBQUksQ0FBQSxDQUFDLElBQUksQ0FBQztBQUM5QixzQkFBc0I7QUFDdEIsZ0NBQWdDO0FBQ2hDLG9DQUFvQztBQUVwQyxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLGNBQWMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFBLElBQUksSUFBSSxDQUFDO0FBQzNELHNCQUFzQjtBQUN0Qiw4REFBOEQ7QUFDOUQsaUVBQWlFO0FBRWpFLE1BQU0sR0FBRyxHQUFHLHdDQUF3QyxDQUFDO0FBQ3JELDBEQUEwRDtBQUUxRCxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUM7QUFDbEIsdUJBQXVCO0FBR3ZCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUTtBQUN6QyxpREFBaUQ7QUFFakQsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvQiwwQkFBMEI7QUFDMUIsb0NBQW9DO0FBRXBDLE1BQU0sR0FBRyxHQUFHLDZCQUE2QixJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDakUseUNBQXlDO0FBQ3pDLHlEQUF5RDtBQUN6RCxnRUFBZ0U7QUFFaEUsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDakYsMkRBQTJEO0FBRTNELE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLFFBQVEsQ0FBQztBQUN0QyxzQkFBc0I7QUFDdEIsNkJBQTZCO0FBQzdCLDJDQUEyQyJ9