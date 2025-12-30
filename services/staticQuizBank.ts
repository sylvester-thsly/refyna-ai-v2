// Static fallback quiz questions organized by category
// Each category has 20 comprehensive questions

export const STATIC_QUIZ_BANK: Record<string, any[]> = {
    'fundamentals': [
        {
            id: '1',
            question: 'What is the primary purpose of whitespace in UI design?',
            options: ['To fill empty space', 'To create visual hierarchy and reduce cognitive load', 'To make the design look expensive', 'To separate colors'],
            correctIndex: 1,
            explanation: 'Whitespace helps group related elements and guides the user\'s eye through the content.'
        },
        {
            id: '2',
            question: 'What is the recommended minimum contrast ratio for normal text (WCAG AA)?',
            options: ['3:1', '4.5:1', '7:1', '2:1'],
            correctIndex: 1,
            explanation: 'WCAG AA requires a minimum contrast ratio of 4.5:1 for normal text to ensure readability.'
        },
        {
            id: '3',
            question: 'Which typography principle suggests using a maximum of 2-3 typefaces?',
            options: ['Font Hierarchy', 'Type Scale', 'Font Pairing', 'Kerning'],
            correctIndex: 2,
            explanation: 'Font pairing principles recommend limiting typefaces to maintain visual consistency.'
        },
        {
            id: '4',
            question: 'What is the 60-30-10 rule in color theory?',
            options: ['60% primary, 30% secondary, 10% accent', '60% text, 30% images, 10% whitespace', '60% content, 30% navigation, 10% footer', '60% desktop, 30% tablet, 10% mobile'],
            correctIndex: 0,
            explanation: 'The 60-30-10 rule suggests using 60% dominant color, 30% secondary color, and 10% accent color.'
        },
        {
            id: '5',
            question: 'What does F-pattern refer to in web design?',
            options: ['Font selection pattern', 'Eye-tracking reading pattern', 'Form layout pattern', 'Footer design pattern'],
            correctIndex: 1,
            explanation: 'F-pattern describes how users typically scan web content in an F-shaped pattern.'
        },
        {
            id: '6',
            question: 'What is the recommended line height for body text?',
            options: ['1.0', '1.5', '2.0', '2.5'],
            correctIndex: 1,
            explanation: 'A line height of 1.5 (150%) is generally recommended for optimal readability.'
        },
        {
            id: '7',
            question: 'What is the purpose of a design system?',
            options: ['To make designs look similar', 'To ensure consistency and scalability', 'To reduce designer workload', 'To impress stakeholders'],
            correctIndex: 1,
            explanation: 'Design systems ensure consistency across products and enable teams to scale efficiently.'
        },
        {
            id: '8',
            question: 'What is the ideal character count per line for readability?',
            options: ['20-40', '45-75', '80-100', '100-120'],
            correctIndex: 1,
            explanation: '45-75 characters per line is optimal for comfortable reading without eye fatigue.'
        },
        {
            id: '9',
            question: 'What does "above the fold" mean?',
            options: ['Content at the top of the page', 'Folded paper design', 'Mobile-first design', 'Responsive breakpoint'],
            correctIndex: 0,
            explanation: 'Above the fold refers to content visible without scrolling, originating from newspaper design.'
        },
        {
            id: '10',
            question: 'What is the purpose of a grid system?',
            options: ['To create visual alignment and consistency', 'To make designs look modern', 'To reduce file size', 'To improve SEO'],
            correctIndex: 0,
            explanation: 'Grid systems provide structure and help maintain consistent alignment across layouts.'
        },
        {
            id: '11',
            question: 'What is the difference between UI and UX?',
            options: ['UI is visual, UX is functional', 'UI is how it looks, UX is how it works', 'UI is for web, UX is for mobile', 'UI is design, UX is development'],
            correctIndex: 1,
            explanation: 'UI focuses on visual interface design, while UX encompasses the entire user experience.'
        },
        {
            id: '12',
            question: 'What is a wireframe?',
            options: ['Final design mockup', 'Low-fidelity layout sketch', 'Interactive prototype', 'Design system documentation'],
            correctIndex: 1,
            explanation: 'Wireframes are low-fidelity sketches showing basic layout and structure without visual design.'
        },
        {
            id: '13',
            question: 'What is the purpose of user personas?',
            options: ['To create fictional characters', 'To represent target user groups', 'To impress clients', 'To fill documentation'],
            correctIndex: 1,
            explanation: 'Personas represent different user types to guide design decisions based on user needs.'
        },
        {
            id: '14',
            question: 'What is A/B testing?',
            options: ['Testing two design versions', 'Testing accessibility', 'Testing browser compatibility', 'Testing load times'],
            correctIndex: 0,
            explanation: 'A/B testing compares two versions to determine which performs better with users.'
        },
        {
            id: '15',
            question: 'What is the purpose of a style guide?',
            options: ['To document design decisions', 'To showcase portfolio work', 'To train new designers', 'To impress stakeholders'],
            correctIndex: 0,
            explanation: 'Style guides document design standards, ensuring consistency across a product or brand.'
        },
        {
            id: '16',
            question: 'What is responsive design?',
            options: ['Fast-loading websites', 'Designs that adapt to screen sizes', 'Interactive animations', 'Voice-controlled interfaces'],
            correctIndex: 1,
            explanation: 'Responsive design ensures layouts adapt seamlessly to different screen sizes and devices.'
        },
        {
            id: '17',
            question: 'What is the purpose of prototyping?',
            options: ['To create final designs', 'To test interactions before development', 'To impress stakeholders', 'To document requirements'],
            correctIndex: 1,
            explanation: 'Prototypes allow testing of interactions and user flows before investing in development.'
        },
        {
            id: '18',
            question: 'What is accessibility in design?',
            options: ['Making designs easy to find', 'Ensuring usability for people with disabilities', 'Creating mobile-friendly designs', 'Optimizing load times'],
            correctIndex: 1,
            explanation: 'Accessibility ensures products are usable by people with various disabilities and abilities.'
        },
        {
            id: '19',
            question: 'What is the purpose of user testing?',
            options: ['To validate design assumptions', 'To find bugs', 'To train users', 'To create documentation'],
            correctIndex: 0,
            explanation: 'User testing validates design decisions by observing real users interacting with the product.'
        },
        {
            id: '20',
            question: 'What is the minimum touch target size for mobile?',
            options: ['32x32 px', '44x44 px', '56x56 px', '64x64 px'],
            correctIndex: 1,
            explanation: 'Apple and Google recommend minimum 44x44 px touch targets for accessibility.'
        }
    ],
    'graphic design': [
        {
            id: '1',
            question: 'What is the Golden Ratio in design?',
            options: ['1:1', '1.618:1', '2:1', '3:2'],
            correctIndex: 1,
            explanation: 'The Golden Ratio (1.618:1) is a mathematical proportion found in nature and used for harmonious layouts.'
        },
        {
            id: '2',
            question: 'Which color model is used for digital screens?',
            options: ['CMYK', 'RGB', 'Pantone', 'HSL'],
            correctIndex: 1,
            explanation: 'RGB (Red, Green, Blue) is the additive color model used for digital displays.'
        },
        {
            id: '3',
            question: 'What does CMYK stand for?',
            options: ['Cyan Magenta Yellow Black', 'Color Mix Yellow Key', 'Creative Media Yellow Kit', 'Cyan Mix Yellow Kelvin'],
            correctIndex: 0,
            explanation: 'CMYK (Cyan, Magenta, Yellow, Key/Black) is the subtractive color model used for print.'
        },
        {
            id: '4',
            question: 'What is kerning in typography?',
            options: ['Line spacing', 'Letter spacing between specific pairs', 'Font weight', 'Text alignment'],
            correctIndex: 1,
            explanation: 'Kerning adjusts space between specific letter pairs for better visual balance.'
        },
        {
            id: '5',
            question: 'What is the rule of thirds in composition?',
            options: ['Divide canvas into 9 equal parts', 'Use 3 colors only', 'Create 3 focal points', 'Use 3 fonts maximum'],
            correctIndex: 0,
            explanation: 'The rule of thirds divides the canvas into a 3x3 grid to create balanced compositions.'
        },
        {
            id: '6',
            question: 'What is negative space?',
            options: ['Dark backgrounds', 'Empty space around objects', 'Deleted elements', 'Shadow areas'],
            correctIndex: 1,
            explanation: 'Negative space (whitespace) is the empty area around and between design elements.'
        },
        {
            id: '7',
            question: 'What is a vector graphic?',
            options: ['Pixel-based image', 'Mathematical path-based image', 'Compressed photo', '3D model'],
            correctIndex: 1,
            explanation: 'Vector graphics use mathematical paths, allowing infinite scaling without quality loss.'
        },
        {
            id: '8',
            question: 'What is brand identity?',
            options: ['Company logo', 'Visual elements representing a brand', 'Marketing strategy', 'Product packaging'],
            correctIndex: 1,
            explanation: 'Brand identity encompasses all visual elements (logo, colors, typography) that represent a brand.'
        },
        {
            id: '9',
            question: 'What is the purpose of a mood board?',
            options: ['Track emotions', 'Visualize design direction', 'Display final work', 'Organize files'],
            correctIndex: 1,
            explanation: 'Mood boards collect visual references to establish the aesthetic direction of a project.'
        },
        {
            id: '10',
            question: 'What is hierarchy in design?',
            options: ['Team structure', 'Visual importance ordering', 'File organization', 'Color arrangement'],
            correctIndex: 1,
            explanation: 'Visual hierarchy guides viewers through content by establishing importance through size, color, and placement.'
        },
        {
            id: '11',
            question: 'What is a monochromatic color scheme?',
            options: ['Black and white only', 'Variations of one hue', 'Two colors', 'Rainbow colors'],
            correctIndex: 1,
            explanation: 'Monochromatic schemes use different shades, tints, and tones of a single color.'
        },
        {
            id: '12',
            question: 'What are complementary colors?',
            options: ['Colors next to each other', 'Opposite colors on color wheel', 'Similar shades', 'Primary colors'],
            correctIndex: 1,
            explanation: 'Complementary colors are opposite each other on the color wheel and create high contrast.'
        },
        {
            id: '13',
            question: 'What is leading in typography?',
            options: ['First letter size', 'Line spacing', 'Font weight', 'Text alignment'],
            correctIndex: 1,
            explanation: 'Leading (line-height) is the vertical space between lines of text.'
        },
        {
            id: '14',
            question: 'What is a serif font?',
            options: ['Sans-serif', 'Font with decorative strokes', 'Script font', 'Monospace font'],
            correctIndex: 1,
            explanation: 'Serif fonts have small decorative strokes (serifs) at the ends of letterforms.'
        },
        {
            id: '15',
            question: 'What is contrast in design?',
            options: ['Color brightness', 'Difference between elements', 'Shadow depth', 'Border thickness'],
            correctIndex: 1,
            explanation: 'Contrast is the difference between design elements (color, size, shape) that creates visual interest.'
        },
        {
            id: '16',
            question: 'What is a grid system used for?',
            options: ['Drawing lines', 'Organizing layout structure', 'Creating patterns', 'Measuring dimensions'],
            correctIndex: 1,
            explanation: 'Grid systems provide structure and consistency for organizing content in layouts.'
        },
        {
            id: '17',
            question: 'What is the purpose of a style guide?',
            options: ['Fashion advice', 'Brand consistency documentation', 'Design inspiration', 'Color palette'],
            correctIndex: 1,
            explanation: 'Style guides document brand standards to ensure consistent visual communication.'
        },
        {
            id: '18',
            question: 'What is saturation in color theory?',
            options: ['Color brightness', 'Color intensity/purity', 'Color temperature', 'Color darkness'],
            correctIndex: 1,
            explanation: 'Saturation refers to the intensity or purity of a color, from gray to vivid.'
        },
        {
            id: '19',
            question: 'What is composition in graphic design?',
            options: ['Writing content', 'Arranging visual elements', 'Creating graphics', 'Choosing colors'],
            correctIndex: 1,
            explanation: 'Composition is the arrangement of visual elements to create a cohesive design.'
        },
        {
            id: '20',
            question: 'What is a color palette?',
            options: ['Painting tool', 'Selected set of colors', 'Color wheel', 'Gradient'],
            correctIndex: 1,
            explanation: 'A color palette is a curated selection of colors used consistently throughout a design.'
        }
    ]
    // Additional categories will be added in the next message due to length
};
