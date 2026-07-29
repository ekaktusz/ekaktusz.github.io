# frozen_string_literal: true

require "nokogiri"
require "pathname"
require "uri"

SITE_ROOT = Pathname("_site").expand_path
errors = []

def generated_target(path)
  clean_path = path.sub(%r{\A/}, "")
  target = SITE_ROOT.join(clean_path)
  return target if target.file?
  return target.join("index.html") if target.directory?
  return SITE_ROOT.join("#{clean_path}.html") if target.extname.empty?

  target
end

Dir.glob(SITE_ROOT.join("**/*.html")).sort.each do |file|
  relative_file = Pathname(file).relative_path_from(SITE_ROOT)
  document = Nokogiri::HTML(File.read(file))

  html = document.at_css("html")
  errors << "#{relative_file}: missing html[lang]" if html&.[]("lang").to_s.empty?

  document.css("img").each do |image|
    errors << "#{relative_file}: image missing alt attribute" unless image.key?("alt")
  end

  document.css("[href], [src]").each do |element|
    value = element["href"] || element["src"]
    next if value.nil? || value.empty? || value.start_with?("#", "mailto:", "tel:", "data:", "//")

    uri = URI.parse(value)
    next if uri.scheme

    path = uri.path
    next if path.nil? || path.empty?

    target =
      if path.start_with?("/")
        generated_target(path)
      else
        Pathname(file).dirname.join(path).cleanpath
      end

    errors << "#{relative_file}: missing local target #{value}" unless target.exist?
  rescue URI::InvalidURIError
    errors << "#{relative_file}: invalid URL #{value}"
  end
end

if errors.empty?
  puts "Generated-site checks passed."
else
  warn errors.join("\n")
  exit 1
end
