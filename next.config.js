/**
 * @type { import("next").NextConfig}
 * https://qiita.com/sddd3/items/89d3c4b4fec0342b649f
 */
const config = {
    // To suppress error of Math in ably library: Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'sqrt')
    swcMinify: false,
    // https://dagashi.pw/react18-useeffect-twice/
    // reactStrictMode: false,
}

module.exports = config
