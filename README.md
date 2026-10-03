# Trade Companion

Build a complete modern trading journal web application for an ICT trader.



The app must be fully functional, responsive, fast, and professional. Do not create only a static landing page. Build the actual working dashboard, journal, analytics, calendar, AI coach, and trader profile.



APP NAME:

"TraderOS"



MAIN NAVIGATION:



1. Dashboard

2. Trade Journal

3. Analytics

4. Calendar

5. AI Coach

6. Personal Trader Profile

7. Settings



DESIGN:



- Dark professional trading-terminal aesthetic

- Clean modern UI

- Desktop and mobile responsive

- Main navigation should be horizontal/top navigation, not a large vertical sidebar

- Minimal unnecessary decoration

- Clear typography

- Professional charts and cards

- Smooth interactions and transitions



DASHBOARD:

Create a complete performance dashboard showing:



- Account balance

- Net P&L

- Total trades

- Win rate

- Profit factor

- Average R

- Average win

- Average loss

- Winning trades

- Losing trades

- Current streak

- Maximum drawdown

- Risk per trade

- Equity curve



The dashboard must automatically calculate these values from Trade Journal data.



EQUITY CURVE:

Create a professional interactive equity curve chart.

It must update automatically whenever trades are added, edited, or deleted.



TRADE JOURNAL:

Create a full trade-entry system with fields:



- Date

- Time

- Market

- Direction: Long / Short

- Entry

- Stop Loss

- Take Profit

- Position Size

- Risk %

- Risk $

- Result: Win / Loss / Breakeven

- R Multiple

- P&L

- Setup

- Session

- Market Condition

- HTF Bias

- Entry Model

- Confluences

- Mistake

- Emotion before trade

- Emotion during trade

- Emotion after trade

- Screenshot before trade

- Screenshot after trade

- Trade notes

- Execution grade



Allow:



- Add trade

- Edit trade

- Delete trade

- Duplicate trade

- Search trades

- Filter trades

- Sort trades

- View complete trade details



ICT-SPECIFIC FIELDS:

Because this is for an ICT trader, include:



- Market Structure

- Liquidity Sweep

- Buy-Side Liquidity

- Sell-Side Liquidity

- Displacement

- Fair Value Gap

- Order Block

- Breaker

- Mitigation

- Premium / Discount

- OTE

- Judas Swing

- SMT Divergence

- Session

- Killzone

- AMD / Power of 3

- Previous Day High

- Previous Day Low

- Previous Week High

- Previous Week Low

- Asian High

- Asian Low

- London High

- London Low

- New York High

- New York Low



ANALYTICS:

Create a detailed analytics page based entirely on journal data.



Show:



- Win rate

- Loss rate

- Profit factor

- Expectancy

- Average R

- Average P&L

- Largest win

- Largest loss

- Max drawdown

- Consecutive wins

- Consecutive losses

- Average holding time



Create charts for:



- Equity curve

- Daily P&L

- Weekly P&L

- Monthly P&L

- Win/Loss distribution

- P&L by market

- P&L by setup

- P&L by session

- P&L by day of week

- P&L by time of day

- Performance by ICT model

- Performance by emotion

- Performance by mistake

- R-multiple distribution



The analytics must identify recurring patterns from actual journal data.



CALENDAR:

Create a monthly trading calendar.



Each day should show:



- Number of trades

- Daily P&L

- Win/loss status

- R result



Clicking a day opens that day's trades.



AI COACH:

Create an AI trading coach page.



The AI Coach should analyze the user's journal data and identify:



- Repeated mistakes

- Best-performing setups

- Worst-performing setups

- Best trading sessions

- Worst trading sessions

- Emotional patterns

- Overtrading patterns

- Revenge trading patterns

- Risk-management problems

- Execution problems

- Missed opportunities

- Strengths

- Weaknesses

- Recurring behavioral patterns



The AI must NOT invent data.



Every insight must be based on actual journal data.



Provide sections:

"What's Working"

"What Is Hurting Performance"

"Recurring Pattern"

"Execution Problem"

"Action Plan"



PERSONAL TRADER PROFILE:

Create a complete personal trader performance profile.



Include:



TRADING STATISTICS



- Win rate

- Profit factor

- Expectancy

- Average R

- Average win

- Average loss

- Max drawdown

- Total trades

- Best setup

- Best session

- Best market



EXECUTION PATTERNS



- Most common mistake

- Most common emotional state

- Most common setup

- Most common entry model

- Most common violation



TRADER STRENGTHS:

Automatically identify strengths from the data.



TRADER WEAKNESSES:

Automatically identify weaknesses from the data.



TRADING STYLE:

Automatically describe the trader's observed trading style based on actual data.



Do NOT use arbitrary personality labels.



REFLECTION:

After each trading day provide a reflection area:



- What did I do well?

- What did I do wrong?

- What did I learn?

- Did I follow my plan?

- What will I improve tomorrow?



Allow the AI Coach to analyze these reflections together with trade data.



RISK MANAGEMENT:

Create a risk-management section.



Allow the trader to configure:



- Account size

- Default risk %

- Maximum daily loss

- Maximum trades per day

- Maximum consecutive losses

- Daily stop rule



Show warnings when journal data indicates a rule violation.



DATA:

Use a proper persistent database.



All trades must be saved permanently.



All dashboard calculations, charts, analytics, calendar information, AI analysis, and trader profile statistics must be derived from the same trade database.



Do not use fake static numbers after the application is functional.



SAMPLE DATA:

Initially provide a small set of clearly marked demo trades so the dashboard and charts can be previewed.



Allow the user to delete demo data.



IMPORT / EXPORT:

Allow:



- CSV import

- CSV export

- JSON backup

- JSON restore



USER EXPERIENCE:

The user should be able to:



1. Open Dashboard

2. Add a trade

3. Save the trade

4. Immediately see updated statistics

5. See the trade appear in Calendar

6. See Analytics update

7. See Equity Curve update

8. See AI Coach identify patterns after enough data exists

9. See Personal Trader Profile update



IMPORTANT:

All calculations must be consistent across the entire application.



Do not create disconnected pages.



Dashboard, Journal, Analytics, Calendar, AI Coach, Reflection, Risk Management, and Personal Trader Profile must all use the same underlying trading data.



Build this as a real functional application, not a mockup.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a7fb5603-8428-46af-9394-e68e363dc641).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
