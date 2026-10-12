# Backport the string-view fix from fmtlib/fmt@6797f0c for RN 0.82's fmt 11.0.2.
# Clang 20+ rejects pointer subtraction between the two separately converted
# FMT_STRING literals. Reuse str_ for the checker, preserving compile-time checks.
# https://github.com/fmtlib/fmt/issues/4396
def patch_fmt_string_view(pods_root)
  header = File.join(pods_root, 'fmt/include/fmt/base.h')
  source = File.read(header)
  return unless source.include?('#define FMT_VERSION 110002')

  original = 'detail::parse_format_string<true>(str_, checker(s));'
  replacement = 'detail::parse_format_string<true>(str_, checker(str_));'
  return if source.include?(replacement)
  raise 'fmt 11.0.2 compatibility patch no longer matches; review upstream changes' unless source.scan(original).length == 1

  File.chmod(File.stat(header).mode | 0200, header)
  File.write(header, source.sub(original, replacement))
end
