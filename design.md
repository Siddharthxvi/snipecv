# SNIPECV DESIGN SYSTEM

This file defines the permanent visual identity for the SNIPECV frontend.

The goal is NOT to create a generic SaaS AI product.

The interface should feel like:

- a precision tool
- an old computing artifact
- a digital archive
- a personal operating system
- a crafted portfolio piece

References:
- Swiss typography
- IBM documentation systems
- early computer interfaces
- editorial layouts
- Teenage Engineering industrial design


==================================================
COLOR SYSTEM
==================================================

Use these colors globally.

Implement as CSS variables.

Example:

:root {

--background: #FFF0DD;

--accent-main: #662222;

--text-primary: #842A3B;

--text-secondary: #A3485A;

--accent-secondary: #6B3F69;

}



--------------------------------------------------
BACKGROUND
--------------------------------------------------

Name:
Warm Paper


HEX:

#FFF0DD


Usage:

- primary application background
- full screen sections
- cards should generally NOT introduce another background


Purpose:

Creates feeling of:
- paper
- resumes
- documents
- archives



Avoid:

pure white (#FFFFFF)



==================================================


MAIN ACCENT

HEX:

#662222


Usage:

Highest importance elements:

- SNIPECV logo text
- main ASCII graphics
- active states
- important numbers
- selected states
- primary icons


Emotion:

- precision
- authority
- premium



==================================================


PRIMARY TEXT

HEX:

#842A3B


Usage:

Default readable text.

Use for:

- headings
- navigation
- paragraphs
- labels


Example:

ABOUT

LOGIN

Dashboard headings



==================================================


SECONDARY TEXT

HEX:

#A3485A


Usage:

Supporting information:

- metadata
- timestamps
- descriptions
- inactive labels


Examples:

"last updated"

"12 memories stored"

"analyzing experience..."



==================================================


SECONDARY ACCENT

HEX:

#6B3F69


Usage:

VERY LIMITED.

Use only for:

- AI-related elements
- hover states
- semantic matching
- embeddings visualization


Examples:

AI match score glow

memory graph nodes

processing animations


Do NOT use heavily.



==================================================
TYPOGRAPHY SYSTEM
==================================================


Primary font:

Helvetica Neue

Fallback:

Helvetica,
Arial,
sans-serif



Rules:

NO decorative fonts.

NO Google SaaS fonts.

Typography should carry the design.


Large headings:

font-weight:
700-900


Letter spacing:

tight


Example:

SNIPECV

font-size:
120-160px desktop

font-weight:
900


--------------------------------------------------


Small UI text:


Uppercase

Letter spacing:

0.08em - 0.15em


Examples:

ABOUT

LOGIN

PROCESSING MEMORY



==================================================
BUTTON SYSTEM
==================================================


Avoid traditional buttons.


NO:

- filled rectangles
- rounded SaaS buttons
- shadows


YES:

text interactions


Default:


LOGIN


Hover:

L O G I N


Implementation:

transition:
letter-spacing

opacity changes



==================================================
MOTION LANGUAGE
==================================================


Animations should feel:

mechanical

not playful



Allowed:

- flip-board rotation
- ASCII transformation
- slow distortion
- cursor delay
- terminal-style reveal



Avoid:

- bouncing
- elastic motion
- colorful particles



==================================================
LANDING PAGE COLOR USAGE
==================================================



Background:

#FFF0DD



SNIPECV:

#662222



ASCII Morph:

#662222



Navigation:

#842A3B



Rotating top-right text:

#842A3B



Hover states:

#6B3F69



Subtle inactive elements:

#A3485A



==================================================
WEBGL DISTORTION STYLE
==================================================


Chromatic aberration must respect palette.


Do NOT use:

bright RGB gaming glitch colors.


Instead:

channel separation should resemble:

- ink misalignment
- old printing errors


Recommended offsets:

Red channel:
#662222 influence


Purple shadow:
#6B3F69


Keep opacity subtle.



==================================================
ASCII ART STYLE
==================================================


ASCII elements:

Color:
#662222


Font:

monospace


Feeling:

old terminal output printed onto paper.


Animation:

slow morphing

not chaotic glitch.



==================================================
COMPONENT PERSONALITY RULE
==================================================


Before creating any component ask:


"Would this exist in an old research computer system?"


If yes:
implement.


If it looks like:

Stripe

OpenAI dashboard

generic AI SaaS

remove.

==================================================