cd ../recomputer.github.io &&
git reset --hard 3d30fce &&
cd ../recomputer &&
tsc && vite build &&
mv dist/* ../recomputer.github.io/ &&
rm -r dist &&
cd ../recomputer.github.io &&
touch .nojekyll &&
perl -pi -w -e 's&<!--stats-->&<script defer src='\"'\"'https://static.cloudflareinsights.com/beacon.min.js'\"'\"' data-cf-beacon='\"'\"'{\"token\": \"0701565b4e494a109d62174c015e387d\"}'\"'\"'></script>&' index.html &&
git add . &&
git commit -m 'Built'